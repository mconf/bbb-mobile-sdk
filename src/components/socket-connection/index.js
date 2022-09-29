import React, { useEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Text, View, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';
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
// TODO BAD - decouple, move elsewhere
import MessageSender from './message-sender';
import MethodTransaction from './method-transaction';
import MethodTransactionManager from './method-transaction-manager';
// TODO BAD - move elsewhere
import AudioManager from '../../services/webrtc/audio-manager';
import VideoManager from '../../services/webrtc/video-manager';
import ScreenshareManager from '../../services/webrtc/screenshare-manager';

// TODO BAD - decouple, move elsewhere - everything from here to getMeetingData
let GLOBAL_WS = null;
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

const makeCall = (name, ...args) => {
  if (GLOBAL_WS == null) throw new TypeError('Socket is not open');

  const transaction = new MethodTransaction(name, args);
  GLOBAL_TRANSACTIONS.addTransaction(transaction);
  sendMessage(GLOBAL_WS, transaction.payload);

  return transaction.promise;
};

const getHost = (_url) => {
  const url = new URL(_url);

  return url.host;
}

const getSessionToken = (_url) => {
  const url = new URL(_url);
  const params = new URLSearchParams(url.search);

  return params.get('sessionToken');
}

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
    host: getHost(html5join),
    sessionToken: getSessionToken(html5join)
  };
};

const initializeMediaManagers = ({ internalUserID, host, sessionToken }) => {
  AudioManager.init({ userId: internalUserID, host, sessionToken, makeCall });
  VideoManager.init({ userId: internalUserID, host, sessionToken, makeCall });
  ScreenshareManager.init({
    userId: internalUserID,
    host,
    sessionToken,
    makeCall
  });
};

const destroyMediaManagers = () => {
  AudioManager.destroy();
  VideoManager.destroy();
  ScreenshareManager.destroy();
};

/// Set up the web socket modules.
const setupModules = (ws) => {
  const messageSender = new MessageSender(ws, GLOBAL_TRANSACTIONS);

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
    module.onConnected();
  });

  return modules;
};

const logout = (ws, meetingData, modules) => {
  if (ws) {
    sendMessage(ws, {
      msg: 'method',
      method: 'userLeftMeeting',
      params: [],
    });

    Object.values(modules).forEach((module) => {
      module.onDisconnectedBeforeWebsocketClose();
    });

    ws.close(0);
  }

  if (Object.keys(meetingData).length) {
    fetch(meetingData.logoutUrl);
  }

  destroyMediaManagers();
};

const SocketConnectionComponent = () => {
  const urlViaLinking = Linking.useURL();
  const [joinUrl, setJoinUrl] = useState('');
  const [meetingData, setMeetingData] = useState({});
  const [websocket, setWebsocket] = useState(null);
  const modules = useRef({});
  const validateReqId = useRef(null);
  const navigation = useNavigation();

  const onOpen = () => {};
  const onClose = () => {
    console.log(`Main websocket connection closed.`);

    tearDownModules(websocket, modules.current);
    setWebsocket(null);
    GLOBAL_WS = null;
  };

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

  useEffect(() => {
    // console.log('Component Will Mount');
    return () => {
      // console.log('Component Will Unmount');
      logout(websocket, meetingData, modules.current);
    };
  }, []);

  useEffect(() => {
    async function getData() {
      if (!joinUrl.length) {
        return;
      }

      const resp = await getMeetingData(joinUrl);
      setMeetingData(resp);
    }
    getData();
  }, [joinUrl]);

  useEffect(() => {
    if (meetingData && Object.keys(meetingData).length) {
      const ws = makeWS(meetingData.enterUrl);

      ws.onopen = onOpen;
      ws.onclose = onClose;
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
          // FIXME initializeMediaManagers: this is definitely not the place
          // to do this. Remove when socket-connection is properly
          // refactored - prlanzarin
          initializeMediaManagers(meetingData);
          modules.current = setupModules(ws);
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
        // console.log('what to do with update');
        break;
      }

      default: {
        // console.log('default case');
      }
    }
  };

  const tearDownModules = () => {
    Object.values(modules.current).forEach((module) => {
      module.onDisconnected();
    });
  };

  return (
    <View>
      <Text style={styles.data}>{JSON.stringify(meetingData)}</Text>
      {}
      <View style={{ height: '20%' }}>
        <TextInput
          placeholder="Join URL"
          onChangeText={(join) => setJoinUrl(join)}
          defaultValue={joinUrl}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  data: {
    color: 'white',
  },
});

export { makeCall };
export default SocketConnectionComponent;
