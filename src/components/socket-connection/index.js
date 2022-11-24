import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import Settings from '../../../settings.json';
import { UsersModule } from './modules/users';
import { GroupChatModule } from './modules/group-chat';
import { GroupChatMsgModule } from './modules/group-chat-msg';
import { MeetingModule } from './modules/meeting';
import { VoiceUsersModule } from './modules/voice-users';
import { VoiceCallStatesModule } from './modules/voice-call-states';
import { PollsModule } from './modules/polls';
import { PadsModule } from './modules/pads';
import { CurrentPollModule } from './modules/current-poll';
import { CurrentUserModule } from './modules/current-user';
import { ExternalVideoMeetingsModule } from './modules/external-video-meetings';
import { PresentationsModule } from './modules/presentations';
import { SlidesModule } from './modules/slides';
import { VideoStreamsModule } from './modules/video-streams';
import { ScreenshareModule } from './modules/screenshare';
import {
  getRandomDigits,
  getRandomAlphanumericWithCaps,
  getRandomAlphanumeric,
  decodeMessage,
} from './utils';
import 'react-native-url-polyfill/auto';
import TextInput from '../text-input';
import logger, {
  injectMakeCall,
  injectAuthInfoFetcher,
  injectSessionIdFetcher,
} from '../../services/logger';
// TODO BAD - decouple, move elsewhere
import MessageSender from './message-sender';
import MethodTransaction from './method-transaction';
import MethodTransactionManager from './method-transaction-manager';
// TODO BAD - move elsewhere
import AudioManager from '../../services/webrtc/audio-manager';
import VideoManager from '../../services/webrtc/video-manager';
import ScreenshareManager from '../../services/webrtc/screenshare-manager';
import { selectUserByIntId } from '../../store/redux/slices/users';
import { selectMeeting } from '../../store/redux/slices/meeting';
import {
  setLoggingIn,
  setLoggedIn,
  setLoggingOut,
  setConnected,
} from '../../store/redux/slices/wide-app/client';

// TODO BAD - decouple, move elsewhere - everything from here to getMeetingData
let GLOBAL_WS = null;
let CURRENT_MEETING_DATA = {};
let CURRENT_SESSION_ID;
let GLOBAL_MESSAGE_SENDER = null;
const GLOBAL_TRANSACTIONS = new MethodTransactionManager();

const sendMessage = (ws, msgObj) => {
  const msg = JSON.stringify(msgObj).replace(/"/g, '\\"');

  ws.send(`["${msg}"]`);
};

const sendConnectMsg = (ws) => {
  sendMessage(ws, {
    msg: 'connect',
    version: '1',
    support: ['1', 'pre2', 'pre1'],
  });
};

// TODO
// eslint-disable-next-line no-unused-vars
const reAuthenticateUser = (ws) => {
  sendMessage(ws, {
    msg: 'sub',
    id: getRandomAlphanumericWithCaps(17),
    name: 'current-user',
    params: [],
  });
};

const sendValidationMsg = (ws, meetingData) => {
  const { meetingID, internalUserID, authToken } = meetingData;
  const validateReqId = getRandomAlphanumeric(32);
  const msg = {
    msg: 'method',
    method: 'validateAuthToken',
    id: validateReqId,
    params: [meetingID, internalUserID, authToken],
  };

  sendMessage(ws, msg);

  return validateReqId;
};

const getAuthInfo = () => {
  const {
    meetingID, sessionToken, internalUserID,
    fullname, externUserID, confname, host,
  } = CURRENT_MEETING_DATA;

  return {
    sessionToken,
    meetingId: meetingID,
    requesterUserId: internalUserID,
    fullname,
    confname,
    externUserID,
    host,
  };
};

const getCurrentSessionId = () => {
  return CURRENT_SESSION_ID;
};

const makeCall = (name, ...args) => {
  if (GLOBAL_WS == null) throw new TypeError('Socket is not open');

  const transaction = new MethodTransaction(name, args);
  GLOBAL_TRANSACTIONS.addTransaction(transaction);
  sendMessage(GLOBAL_WS, transaction.payload);

  return transaction.promise;
};

const getHostFromURL = (_url) => {
  const url = new URL(_url);

  return url.host;
};

const getSessionToken = (_url) => {
  const url = new URL(_url);
  const params = new URLSearchParams(url.search);

  return params.get('sessionToken');
};

const makeWS = (joinUrl) => {
  const url = new URL(joinUrl);
  const wsUrl = `wss://${url.host}/html5client/sockjs/${getRandomDigits(
    3
  )}/${getRandomAlphanumeric(8)}/websocket`;

  // eslint-disable-next-line no-undef
  return new WebSocket(wsUrl);
};

const makeEnterUrl = (joinUrl) => {
  const url = new URL(joinUrl);
  const params = new URLSearchParams(url.search);

  return `${url.protocol}//${
    url.host
  }/bigbluebutton/api/enter?sessionToken=${params.get('sessionToken')}`;
};

const getMeetingData = async (joinUrl) => {
  const joinResp = await fetch(joinUrl, {
    method: 'GET',
  });
  const html5join = joinResp.url;
  const enterUrl = makeEnterUrl(html5join);
  const enterResp = await fetch(enterUrl).then((r) => r.json());

  return {
    enterUrl,
    ...enterResp.response,
    host: getHostFromURL(html5join),
    sessionToken: getSessionToken(html5join)
  };
};

const initializeMediaManagers = ({ internalUserID, host, sessionToken }) => {
  const mediaManagerConfigs = {
    userId: internalUserID,
    host,
    sessionToken,
    makeCall,
    logger,
  };
  AudioManager.init(mediaManagerConfigs);
  VideoManager.init(mediaManagerConfigs);
  ScreenshareManager.init(mediaManagerConfigs);
};

const destroyMediaManagers = () => {
  AudioManager.destroy();
  VideoManager.destroy();
  ScreenshareManager.destroy();
};

/// Set up the web socket modules.
const setupModules = (ws) => {
  const messageSender = new MessageSender(ws, GLOBAL_TRANSACTIONS);
  GLOBAL_MESSAGE_SENDER = messageSender;

  const modules = {
    users: new UsersModule(messageSender),
    meetings: new MeetingModule(messageSender),
    voiceUsers: new VoiceUsersModule(messageSender),
    polls: new PollsModule(messageSender),
    pads: new PadsModule(messageSender),
    presentations: new PresentationsModule(messageSender),
    slides: new SlidesModule(messageSender),
    screenshare: new ScreenshareModule(messageSender),
    'current-poll': new CurrentPollModule(messageSender),
    'current-user': new CurrentUserModule(messageSender),
    'external-video-meetings': new ExternalVideoMeetingsModule(messageSender),
    'group-chat': new GroupChatModule(messageSender),
    'group-chat-msg': new GroupChatMsgModule(messageSender),
    'video-streams': new VideoStreamsModule(messageSender),
    voiceCallStates: new VoiceCallStatesModule(messageSender),
    // ** meteor Collections **//
    // Screenreader-alert:
    // annotations:
    // audio-captions:
    // auth-token-validation:
    // breakouts:
    // breakouts-history:
    // captions:
    // connection-status:
    // guestUsers:
    // layout-meetings:
    // meeting-time-remaining:
    // notifications:
    // pads-sessions:
    // pads-updates:
    // presentation-pods:
    // presentation-upload-token:
    // record-meetings:
    // slide-positions:
    // users-infos:
    // users-persistent-data:
    // users-settings:
    // users-typing:
    // whiteboard-multi-user:
  };

  Object.values(modules).forEach((module) => {
    if (module !== 'current-poll') {
      module.onConnected();
    }
  });

  return modules;
};

const terminate = (ws, modules) => {
  if (ws) {
    ws.close();
  }

  Object.values(modules).forEach((module) => {
    module.onDisconnectedBeforeWebsocketClose();
  });

  destroyMediaManagers();
};

const SocketConnectionComponent = (props) => {
  // jUrl === join Url from portal
  const { jUrl } = props;
  const urlViaLinking = Linking.useURL();
  const [joinUrl, setJoinUrl] = useState('');
  const [meetingData, setMeetingData] = useState({});
  const [websocket, setWebsocket] = useState(null);
  const modules = useRef({});
  const validateReqId = useRef(null);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { loggedOut, ejected } = useSelector((state) => {
    const user = selectUserByIntId(state, meetingData.internalUserID);
    return { loggedOut: user?.loggedOut, ejected: user?.ejected };
  });
  const meetingEnded = useSelector((state) => selectMeeting(state)?.meetingEnded);
  const {
    loggedIn,
    loggingOut,
    loggingIn,
    connected,
  } = useSelector((state) => state.client);

  const onOpen = () => {
    dispatch(setConnected(true));
    logger.info({
      logCode: 'main_websocket_open',
    }, 'Main websocket connection open');
  };

  const onClose = () => {
    dispatch(setConnected(false));
    logger.info({
      logCode: 'main_websocket_closed',
    }, 'Main websocket connection closed');
  };

  const onError = (error) => {
    logger.info({
      logCode: 'main_websocket_error',
      extraInfo: {
        errorMessage: error.message,
        errorCode: error.code,
      },
    }, `Main websocket error: ${error.message}`);
  };

  useEffect(() => {
    if (connected === false) {
      tearDownModules(websocket, modules.current);
      if (loggingOut) {
        setJoinUrl('');
        dispatch(setLoggedIn(false));
      }
    }
  }, [connected, loggingOut]);

  const onMessage = (ws, event) => {
    let msg = event.data;

    if (msg === 'o') {
      sendConnectMsg(ws);
    } else {
      if (msg.startsWith('a')) {
        msg = msg.substring(1, msg.length);
      }
      const msgObj = decodeMessage(msg);

      if (Object.keys(msgObj).length) {
        processMessage(ws, msgObj, meetingData, modules.current);
      }
    }
  };

  const _terminate = (_loggingOut) => {
    // Termination can happen for reasons other than a shutdown (ie reconnections)
    // If loggingOut is true, then this is a final action (ejection, leave, ...)
    if (_loggingOut) dispatch(setLoggingOut(true));

    terminate(websocket, modules.current);

    if (_loggingOut && meetingData && typeof meetingData.logoutUrl === 'string') {
      fetch(meetingData.logoutUrl);
    }
  };

  // Login/logout tracker
  useEffect(() => {
    if (!loggingOut
      && (loggedOut === true || ejected === true || meetingEnded === true)) {
      // User is logged in, isn't logging out yet but the server side data
      // mandates a logout -> start the logout procedure
      _terminate(true);
    } else if (!loggedIn && !joinUrl && loggingOut) {
      // Isn't logged in - clean up data.
      setWebsocket(null);
      GLOBAL_WS = null;
      setMeetingData({});
      dispatch(setLoggingOut(false));
    }
  }, [joinUrl, loggedIn, loggingOut, ejected, loggedOut, meetingEnded]);

  useEffect(() => {
    setJoinUrl(jUrl);
    return () => {
      _terminate(false);
    };
  }, []);

  useEffect(() => {
    async function getData(_joinUrl) {
      try {
        dispatch(setLoggingIn(true));
        const resp = await getMeetingData(_joinUrl);
        setMeetingData(resp);
        CURRENT_MEETING_DATA = resp;
      } catch (error) {
        logger.info({
          logCode: 'user_join_failed',
          extraInfo: {
            errorMessage: error.message,
            errorCode: error.code,
          },
        }, `User join failed: ${error.message}`);
        setJoinUrl('');
        dispatch(setLoggingIn(false));
      }
    }

    if (joinUrl?.length && !loggingOut && !loggingIn && !loggedIn) {
      getData(joinUrl);
    }
  }, [joinUrl, loggedIn, loggingIn, loggingOut]);

  useEffect(() => {
    if (meetingData && Object.keys(meetingData).length) {
      const ws = makeWS(meetingData.enterUrl);

      ws.onopen = onOpen;
      ws.onclose = onClose;
      ws.onerror = onError;
      ws.onmessage = (msg) => onMessage(ws, msg);

      setWebsocket(ws);
      // TODO move this elsewhere - prlanzarin
      GLOBAL_WS = ws;
    }
  }, [meetingData]);

  useEffect(() => {
    if (urlViaLinking?.includes('/bigbluebutton/api/join?')) {
      const joinUrlFiltered = urlViaLinking.replace('bigbluebutton://', 'https://');
      setJoinUrl(joinUrlFiltered);
    }
  }, [urlViaLinking]);

  useEffect(() => {
    if (meetingData?.returncode === 'SUCCESS') {
      navigation.navigate('Main');
    }
  }, [meetingData]);

  const processMessage = (ws, msgObj) => {
    switch (msgObj.msg) {
      case 'connected': {
        validateReqId.current = sendValidationMsg(ws, meetingData);
        break;
      }

      case 'ping': {
        sendMessage(ws, { msg: 'pong' });
        break;
      }

      case 'result': {
        // We're resolving a validateAuthToken request
        if (msgObj.id === validateReqId.current) {
          modules.current = setupModules(ws);
          // FIXME initializeMediaManagers: this is definitely not the place
          // to do this. Remove when socket-connection is properly
          // refactored - prlanzarin
          initializeMediaManagers(meetingData);
          dispatch(setLoggedIn(true));
          dispatch(setLoggingIn(false));
        } else {
          // Probably dealing with a module makeCall/method response
          if (msgObj.collection) {
            const currentModule = modules.current[msgObj.collection];
            if (currentModule) {
              currentModule.processMessage(msgObj);
            }
          } else {
            Object.values(modules.current).forEach((module) => {
              module.processMessage(msgObj);
            });
          }

          // Resolve/reject any higher level transactions called from /services/api/makeCall
          if (typeof msgObj.error === 'object') {
            GLOBAL_TRANSACTIONS.rejectTransaction(msgObj.id, msgObj.error);
          } else {
            GLOBAL_TRANSACTIONS.resolveTransaction(msgObj.id, msgObj.result);
          }
        }
        break;
      }

      case 'added': {
        const currentModule = modules.current[msgObj.collection];
        if (currentModule) {
          currentModule.add(msgObj);
        }

        break;
      }

      case 'removed': {
        const currentModule = modules.current[msgObj.collection];
        if (currentModule) {
          currentModule.remove(msgObj);
        }
        break;
      }

      case 'changed': {
        const currentModule = modules.current[msgObj.collection];
        if (currentModule) {
          currentModule.update(msgObj);
        }

        break;
      }

      case 'updated': {
        break;
      }

      default:
        break;
    }
  };

  const tearDownModules = () => {
    Object.values(modules.current).forEach((module) => {
      module.onDisconnected();
    });
  };

  if (Settings.dev) {
    return (
      <View>
        <Text>{JSON.stringify(meetingData)}</Text>
        <View style={{ height: '20%' }}>
          <TextInput
            placeholder="Join URL"
            onSubmitEditing={({ nativeEvent: { text } }) => setJoinUrl(text)}
            defaultValue={joinUrl}
          />
        </View>
      </View>
    );
  }

  return null;
};

// TODO refactor out - see logger.js - prlanzarin
injectMakeCall(makeCall);
injectAuthInfoFetcher(getAuthInfo);
injectSessionIdFetcher(getCurrentSessionId);

export default SocketConnectionComponent;
// General API stuff that is bound to signaling and join procedures
// TODO should be moved elsewhere
export {
  getCurrentSessionId,
  getAuthInfo,
  makeCall,
  GLOBAL_MESSAGE_SENDER,
};
