import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Settings from '../../../settings.json';
// collections
import { BreakoutsModule } from './modules/breakouts';
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
import { GuestUsersModule } from './modules/guest-users';
import { RecordMeetingsModule } from './modules/record-meetings';
import { UsersSettingsModule } from './modules/users-settings';
import { UploadedFileModule } from './modules/uploaded-file';
import { PadsSessionsModule } from './modules/pads-sessions';
// streams
import { StreamExternalVideoModule } from './stream/external-videos';
import {
  getRandomDigits,
  getRandomAlphanumericWithCaps,
  getRandomAlphanumeric,
  parseDDP,
  stringifyDDP,
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
import { store } from '../../store/redux/store';
import { selectUserByIntId } from '../../store/redux/slices/users';
import { selectMeeting } from '../../store/redux/slices/meeting';
import { selectCurrentUserRole } from '../../store/redux/slices/current-user';
import {
  setLoggingIn,
  setLoggedIn,
  setLoggingOut,
  setConnected,
  setMeetingData,
  setJoinUrl,
  sessionStateChanged,
  join,
} from '../../store/redux/slices/wide-app/client';
import usePrevious from '../../hooks/use-previous';

// TODO BAD - decouple, move elsewhere - everything from here to getMeetingData
let GLOBAL_WS = null;
let CURRENT_SESSION_ID;
let GLOBAL_MESSAGE_SENDER = null;
const GLOBAL_TRANSACTIONS = new MethodTransactionManager();
const TERMINATION_REASONS = [
  'user_logged_out_reason',
  'validate_token_failed_eject_reason',
  'banned_user_rejoining_reason',
  'joined_another_window_reason',
  'user_inactivity_eject_reason',
  'user_requested_eject_reason',
  'duplicate_user_in_meeting_eject_reason',
  'not_enough_permission_eject_reason',
  'able_to_rejoin_user_disconnected_reason',
];

const sendMessage = (ws, msgObj) => {
  try {
    const msg = stringifyDDP(msgObj).replace(/\\|"/g, (match) => `\\${match}`);
    ws.send(`["${msg}"]`);
  } catch (error) {
    // eslint-disable-next-line no-console
    logger.error({
      logCode: 'main_websocket_error',
      extraInfo: { error, msgObj },
    }, `Main websocket send failed: ${error} enqueue= ${msgObj?.msg || 'Unknown'}`);
  };
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

const getAuthInfo = (meetingData) => {
  let _meetingData = meetingData;

  if (_meetingData == null) {
    try {
      _meetingData = store.getState().client.meetingData;
    } catch (error) {
      return null;
    }
  }

  const {
    meetingID, sessionToken, internalUserID,
    fullname, externUserID, confname, host,
    joinUrl,
  } = _meetingData;

  return {
    sessionToken,
    meetingId: meetingID,
    requesterUserId: internalUserID,
    fullname,
    confname,
    externUserID,
    host,
    joinUrl,
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

const makeWS = (joinUrl) => {
  const url = new URL(joinUrl);
  const wsUrl = `wss://${url.host}/html5client/sockjs/${getRandomDigits(
    3
  )}/${getRandomAlphanumeric(8)}/websocket`;

  // eslint-disable-next-line no-undef
  return new WebSocket(wsUrl);
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

  // Mirrors for Meteor collections that are fully implemented
  const modules = {
    voiceUsers: new VoiceUsersModule(messageSender),
    voiceCallStates: new VoiceCallStatesModule(messageSender),
    presentations: new PresentationsModule(messageSender),
    slides: new SlidesModule(messageSender),
    polls: new PollsModule(messageSender),
    'current-poll': new CurrentPollModule(messageSender),
    'group-chat': new GroupChatModule(messageSender),
    'group-chat-msg': new GroupChatMsgModule(messageSender),
    'video-streams': new VideoStreamsModule(messageSender),
    screenshare: new ScreenshareModule(messageSender),
    meetings: new MeetingModule(messageSender),
    'current-user': new CurrentUserModule(messageSender),
    users: new UsersModule(messageSender),
    guestUsers: new GuestUsersModule(messageSender),
    breakouts: new BreakoutsModule(messageSender),
    'record-meetings': new RecordMeetingsModule(messageSender),
    'users-settings': new UsersSettingsModule(messageSender),
    'uploaded-file': new UploadedFileModule(messageSender),
    'external-video-meetings': new ExternalVideoMeetingsModule(messageSender),
    pads: new PadsModule(messageSender),
    'pads-sessions': new PadsSessionsModule(messageSender),
  };

  /*
   * Collections for experimental or partially implemented fetaures
   * Pending:
   *  Screenreader-alert:
   *  annotations:
   *  audio-captions:
   *  auth-token-validation:
   *  breakouts:
   *  breakouts-history:
   *  captions:
   *  connection-status:
   *  guestUsers:
   *  layout-meetings:
   *  meeting-time-remaining:
   *  notifications:
   *  pads-sessions:
   *  pads-updates:
   *  presentation-pods:
   *  presentation-upload-token:
   *  record-meetings:
   *  slide-positions:
   *  users-infos:
   *  users-persistent-data:
   *  users-settings:
   *  users-typing:
   *  whiteboard-multi-user:
   */
  if (Settings.dev) {
    modules['external-video-meetings'] = new ExternalVideoMeetingsModule(messageSender);
  }

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
  const websocket = useRef(null);
  const modules = useRef({});
  const validateReqId = useRef(null);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [authTokenValidated, setAuthTokenValidated] = useState(false);
  const online = useSelector((state) => state.client.connectionStatus.isConnected);
  const sessionEnded = useSelector((state) => state.client.sessionState.ended);
  const {
    meetingData,
    guestStatus,
  } = useSelector((state) => state.client);
  const {
    loggedIn,
    loggingOut,
    loggingIn,
    connected,
  } = useSelector((state) => state.client.sessionState);
  const joinUrl = useSelector((state) => state.client.meetingData.joinUrl);
  const enterUrl = useSelector((state) => state.client.meetingData.enterUrl);
  const userLoggedOut = useSelector((state) => {
    return selectUserByIntId(state, meetingData.internalUserID)?.userLoggedOut;
  });
  const ejected = useSelector((state) => {
    return selectUserByIntId(state, meetingData.internalUserID)?.ejected;
  });
  const meetingEnded = useSelector((state) => selectMeeting(state)?.meetingEnded);
  const basicSubscriptionsAreReady = useSelector((state) => {
    return state.meetingCollection.ready
      && state.currentUserCollection.ready
      && state.usersCollection.ready;
  });
  const currentRole = useSelector(selectCurrentUserRole);
  const previousRole = usePrevious(currentRole);
  const currentUserReady = useSelector((state) => state.currentUserCollection.ready);

  useEffect(() => {
    if (currentUserReady && currentRole === 'MODERATOR' && previousRole === 'VIEWER') {
      // force resubscribe on role dependent collections
      ['meetings', 'users', 'guestUsers', 'record-meetings'].forEach((module) => {
        modules.current[module].onDisconnected();
        modules.current[module].onConnected();
      });
    }
  }, [currentUserReady, currentRole]);

  useEffect(() => {
    if (jUrl && typeof jUrl === 'string' && jUrl !== joinUrl) {
      dispatch(setJoinUrl(jUrl));
    }
  }, [jUrl]);

  useEffect(() => {
    return () => {
      _terminate(false);
    };
  }, []);

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
      tearDownModules();
      if (loggingOut) {
        dispatch(setJoinUrl(null));
        setAuthTokenValidated(false);
        dispatch(setLoggedIn(false));
      }
    }
  }, [connected, loggingOut]);

  useEffect(() => {
    if (authTokenValidated && basicSubscriptionsAreReady) {
      dispatch(setLoggedIn(true));
      dispatch(setLoggingIn(false));
    }
  }, [authTokenValidated, basicSubscriptionsAreReady]);

  const onMessage = (ws, event) => {
    let msg = event.data;

    if (msg === 'o') {
      sendConnectMsg(ws);
    } else {
      if (msg.startsWith('a')) msg = msg.substring(1, msg.length);

      const msgObj = parseDDP(msg);

      if (msgObj && Object.keys(msgObj).length) {
        processMessage(ws, msgObj, meetingData, modules.current);
      }
    }
  };

  const _terminate = (_loggingOut) => {
    // Termination can happen for reasons other than a shutdown (ie reconnections)
    // If loggingOut is true, then this is a final action (ejection, leave, ...)
    if (_loggingOut) dispatch(setLoggingOut(true));

    terminate(websocket.current, modules.current);
    // This is a sure socket termination - guarantee it is set as disconnected
    // because we can't rely on onClose in scenarios like component unmounts
    dispatch(setConnected(false));

    if (_loggingOut && meetingData && typeof meetingData.logoutUrl === 'string') {
      fetch(meetingData.logoutUrl);
    }
  };

  useEffect(() => {
    if (sessionEnded) _terminate(true);
  }, [sessionEnded]);

  // Login/logout tracker
  useEffect(() => {
    if ((!loggingOut && loggedIn)
      && (userLoggedOut === true || ejected === true || meetingEnded === true)) {
      // User is logged in, isn't logging out yet but the server side data
      // mandates a logout -> start the logout procedure
      _terminate(true);
    } else if (!loggedIn && !joinUrl && loggingOut) {
      // Isn't logged in - clean up data.
      // TODO check readyState and terminate if necessary
      websocket.current = null;
      GLOBAL_WS = null;
      dispatch(setMeetingData({}));
      dispatch(setLoggingOut(false));
    }
  }, [joinUrl, loggedIn, loggingOut, ejected, userLoggedOut, meetingEnded]);

  useEffect(() => {
    if (joinUrl?.length && !loggingOut && !loggingIn && !loggedIn) {
      // First run of the join procedure
      // If it runs into a guest lobby, it'll be run again in the guest status
      // thunk if it succeeds - see client/fetchGuestStatus
      dispatch(join({ url: joinUrl, logger })).unwrap()
        .catch((error) => {
          logger.error({
            logCode: 'join_error',
            extraInfo: { error },
          }, `First run of the join procedure error: ${error}`);
        });
    }
  }, [joinUrl, loggedIn, loggingIn, loggingOut]);

  useEffect(() => {
    if (enterUrl
      && online
      && !connected
      && !loggingOut
      && guestStatus === 'ALLOW'
    ) {
      const ws = makeWS(enterUrl);

      ws.onopen = onOpen;
      ws.onclose = onClose;
      ws.onerror = onError;
      ws.onmessage = (msg) => onMessage(ws, msg);

      websocket.current = ws;
      // TODO move this elsewhere - prlanzarin
      GLOBAL_WS = ws;
    }
  }, [enterUrl, online, connected, loggingOut, guestStatus]);

  useEffect(() => {
    if (loggingIn) navigation.navigate('Main');
  }, [loggingIn]);

  const processMessage = (ws, msgObj) => {
    // FIXME: different collection/subscription names
    if (msgObj.collection === 'guestUser') {
      msgObj.collection = 'guestUsers';
    }
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
          // Session ended
          if (msgObj?.result?.reason
            && TERMINATION_REASONS.some((reason) => reason === msgObj.result.reason)) {
            dispatch(sessionStateChanged({
              ended: true,
              endReason: msgObj.result.reason,
            }));
            return;
          }

          modules.current = setupModules(ws);
          // FIXME initializeMediaManagers: this is definitely not the place
          // to do this. Remove when socket-connection is properly
          // refactored - prlanzarin
          initializeMediaManagers(meetingData);
          setAuthTokenValidated(true);
          makeCall('setMobileUser').catch((error) => {
            logger.warn({
              logCode: 'set_mobile_user_failed',
            }, `Failed to flag app as mobile user: ${error.message}`);
          });
        } else {
          // Session ended
          if (msgObj?.result?.reason
            && TERMINATION_REASONS.some((reason) => reason === msgObj.result.reason)) {
            dispatch(sessionStateChanged({
              ended: true,
              endReason: msgObj.result.reason,
            }));
            return;
          }

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
          if (GLOBAL_TRANSACTIONS.hasTransaction(msgObj.id)) {
            if (typeof msgObj.error === 'object') {
              GLOBAL_TRANSACTIONS.rejectTransaction(msgObj.id, msgObj.error);
            } else {
              GLOBAL_TRANSACTIONS.resolveTransaction(msgObj.id, msgObj.result);
            }
          }
        }
        break;
      }

      case 'added': {
        const currentModule = modules.current[msgObj.collection];
        if (currentModule) {
          if (msgObj.id !== 'publication-stop-marker') {
            currentModule.add(msgObj);
          } else {
            currentModule.onPublicationStopMarker(msgObj);
          }
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
        // BAD
        if (msgObj.collection.includes("stream-external-videos")) {
          const SEVModule = new StreamExternalVideoModule(GLOBAL_MESSAGE_SENDER);
          SEVModule.update(msgObj);
        }
        if (currentModule) {
          currentModule.update(msgObj);
        }

        break;
      }

      // The following messages should be processed by the modules themselves
      case 'ready':
      case 'nosub': {
        Object.values(modules.current).forEach((module) => {
          module.processMessage(msgObj);
        });
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
            onSubmitEditing={({ nativeEvent: { text } }) => dispatch(setJoinUrl(text))}
            defaultValue=""
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
