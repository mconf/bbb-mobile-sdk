import { useEffect, useState, useRef } from 'react';
import {
  ApolloClient, InMemoryCache, ApolloLink,
} from '@apollo/client';
import { useDispatch } from 'react-redux';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { onError } from '@apollo/client/link/error';
import uuid from 'react-native-uuid';
import UrlUtils from '../../utils/functions';
import {
  setJoinUrl, setApi, setHost, setSessionToken
} from '../../store/redux/slices/wide-app/client';
import logger from '../../services/logger';
import { setMeetingSettings } from '../local-states/useMeetingSettings';

const useJoinMeeting = (url) => {
  const [loginStage, setLoginStage] = useState(0);
  const [sessionToken, setLocalSessionToken] = useState(null);
  const [urlWithSessionId, setUrlWithSessionId] = useState(null);
  const [graphqlUrlApolloClient, setApolloClient] = useState(null);
  const [graphqlWebsocketUrl, setGraphqlWebsocketUrl] = useState(null);
  const [graphqlApiUrl, setGraphqlApiUrl] = useState(null);
  const [clientSettings, setClientSettings] = useState(null);
  const [host, setLocalHost] = useState('');
  const numberOfAttempts = useRef(20);
  const tsLastMessageRef = useRef(0);
  const tsLastPingMessageRef = useRef(0);
  const dispatch = useDispatch();

  async function requestSessionToken() {
    fetch(`${url}`)
      .then((data) => {
        if (data.status === 200) {
          setUrlWithSessionId(data.url);
          setLocalSessionToken(UrlUtils.parseQueryString(data.url).sessionToken);
          setLocalHost(UrlUtils.getHostFromUrl(data.url));
          dispatch(setJoinUrl(data.url));
          dispatch(setHost(UrlUtils.getHostFromUrl(data.url)));
          dispatch(setSessionToken(UrlUtils.parseQueryString(data.url).sessionToken));
          console.log('DONE STAGE 0');
          setLoginStage(1);
        }
      })
      .catch((error) => console.error('error requestSessionToken()', error));
  }

  async function joinWithSessionToken() {
    fetch(`${urlWithSessionId}`)
      .then((data) => {
        if (data.status === 200) {
          setLoginStage(2);
          console.log('DONE STAGE 1');
        }
      })
      .catch((error) => console.error('error joinWithSessionToken()', error));
  }

  async function callApi() {
    fetch(`https://${host}/bigbluebutton/api`, {
      credentials: 'include',
    })
      .then((response) => response.text())
      .then((xmlString) => {
        try {
          const data = UrlUtils.xml2json(xmlString);
          const gqWs = data.graphqlWebsocketUrl;
          const gqUrl = data.graphqlApiUrl;
          setGraphqlApiUrl(gqUrl);
          setGraphqlWebsocketUrl(gqWs);
          dispatch(setApi({
            graphqlWebsocketUrl: gqWs,
            graphqlApiUrl: gqUrl,
          }));
          console.log('DONE STAGE 2');
          setLoginStage(3);
        } catch (error) {
          console.error('Error parsing callApi() response', error);
        }
      })
      .catch((error) => {
        console.error('error callApi()', error);
      });
  }

  async function getClientStartupSettings() {
    // fetch(`${graphqlApiUrl}/clientStartupSettings`, {
    //   credentials: 'include',
    //   headers: {
    //     'X-Session-Token': sessionToken,
    //   }
    // })
    //   .then((response) => response.json())
    //   .then((data) => {
    //     setClientStartupSettings(data.meeting_clientSettings[0]);
    console.log('DONE STAGE 3');
    setLoginStage(4);
    // })
    // .catch((error) => console.error('error getClientStartupSettings()', error));
  }

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message }) => {
        console.error(`[GraphQL error]: Message: ${message}`);
      });
    }

    if (networkError) {
      console.error(`[Network error]: ${networkError}`);
    }
  });

  const estimatePayloadSize = (variables) => {
    const variablesAsString = JSON.stringify(variables);
    // eslint-disable-next-line no-undef
    const variablesAsBlob = new Blob([variablesAsString]);
    return variablesAsBlob.size;
  };

  const payloadSizeCheckLink = new ApolloLink((operation, forward) => {
    if (operation.query.definitions.some((def) => 'operation' in def && def.operation === 'mutation')) {
      const size = estimatePayloadSize(operation.variables);
      const maxPayloadSize = 10485760; // 10MB

      if (size > maxPayloadSize) {
        const errorMsg = `Mutation payload is too large: ${size} bytes. ${maxPayloadSize} maximum allowed.`;
        console.error(errorMsg);
        return null;
      }
    }

    console.log(`Valid ${operation.operationName} payload. Following with the query.`);
    return forward(operation);
  });

  async function connectGraphqlServer() {
    if (sessionToken == null) return;
    const clientSessionUUID = uuid.v4();

    let wsLink;
    try {
      const subscription = createClient({
        url: graphqlWebsocketUrl,
        retryAttempts: numberOfAttempts.current,
        keepAlive: 99999999999,
        retryWait: async () => {
          return new Promise((res) => {
            setTimeout(() => {
              res();
            }, 10000);
          });
        },
        shouldRetry: (error) => {
          if (error.code === 4403) {
            console.error('Session token is invalid', error);
            return false;
          }
          return true;
        },
        connectionParams: {
          headers: {
            'X-Session-Token': sessionToken,
            'X-ClientSessionUUID': clientSessionUUID,
            'X-ClientType': 'HTML5',
            'X-ClientIsMobile': 'true',
          },
        },
        on: {
          error: (error) => {
            logger.error({
              logCode: 'main_websocket_error',
              extraInfo: {
                errorStack: error?.stack,
                errorMessage: error?.message,
                errorCode: error?.code,
              },
            }, 'Main websocket connection error');
            console.error(`Error: on subscription to server: ${JSON.stringify(error, null, 2)}`);
          },
          closed: () => {
            console.error('socket closed');
          },
          connected: () => {
            logger.info({
              logCode: 'main_websocket_open',
            }, 'Main websocket connection open');
          },
          connecting: () => {
            console.log('socket connecting');
          },
          message: (message) => {
            if (message.type === 'ping') {
              tsLastPingMessageRef.current = Date.now();
            }
            tsLastMessageRef.current = Date.now();
          },

        },
      });
      const graphWsLink = new GraphQLWsLink(
        subscription,
      );
      wsLink = ApolloLink.from([payloadSizeCheckLink, errorLink, graphWsLink]);
      wsLink.setOnError((error) => {
        throw new Error('Error: on apollo connection'.concat(JSON.stringify(error) || ''));
      });
    } catch (error) {
      throw new Error('Error creating WebSocketLink: '.concat(JSON.stringify(error) || ''));
    }
    let client;
    try {
      client = new ApolloClient({
        link: wsLink,
        cache: new InMemoryCache(),
        connectToDevTools: true,
      });
      setApolloClient(client);
      console.log('DONE STAGE 4');
      setLoginStage(5);
    } catch (error) {
      throw new Error('Error creating Apollo Client: '.concat(JSON.stringify(error) || ''));
    }
  }

  async function getClientSettings() {
    fetch(`${graphqlApiUrl}/clientSettings`, {
      credentials: 'include',
      headers: {
        'X-Session-Token': sessionToken,
      }
    })
      .then((response) => response.json())
      .then((data) => {
        const cSettings = data.meeting_clientSettings[0].clientSettingsJson;
        setClientSettings(cSettings?.public);
        setMeetingSettings(cSettings);
        console.log('DONE STAGE 5');
        setLoginStage(6);
      });
  }

  useEffect(() => {
    switch (loginStage) {
      case 0:
        requestSessionToken();
        break;
      case 1:
        joinWithSessionToken();
        break;
      case 2:
        callApi();
        break;
      case 3:
        getClientStartupSettings();
        break;
      case 4:
        connectGraphqlServer();
        break;
      case 5:
        getClientSettings();
        break;
      case 6:
        console.log('LOGIN COMPLETE');
        break;
      default:
        console.log('error');
    }
  }, [loginStage]);

  return {
    graphqlUrlApolloClient,
    sessionToken,
    loginStage,
    clientSettings
  };
};

export default useJoinMeeting;
