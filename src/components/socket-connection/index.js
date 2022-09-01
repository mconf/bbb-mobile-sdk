import React, { useEffect, useRef, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { UsersModule } from './modules/users';
import { ChatModule } from './modules/chat';
import { MeetingModule } from './modules/meeting';
import { VoiceUsersModule } from './modules/voice-users';
import { PollsModule } from './modules/polls';
import { PadsModule } from './modules/pads';
import { CurrentPollModule } from './modules/current-poll';
import { CurrentUserModule } from './modules/current-user';
import { ExternalVideoMeetingsModule } from './modules/external-video-meetings';
import { PresentationsModule } from './modules/presentations';
import { SlidesModule } from './modules/slides';
import {
  getRandomDigits,
  getRandomAlphanumericWithCaps,
  getRandomAlphanumeric,
  decodeMessage,
} from './utils';
import 'react-native-url-polyfill/auto';
import TextInput from '../text-input';
import MessageSender from './message-sender';

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

  return enterResp.response;
};

/// Set up the web socket modules.
const setupModules = (ws) => {
  const messageSender = new MessageSender(ws);
  const chatModule = new ChatModule(messageSender);

  const modules = {
    users: new UsersModule(messageSender),
    meetings: new MeetingModule(messageSender),
    voiceUsers: new VoiceUsersModule(messageSender),
    polls: new PollsModule(messageSender),
    pads: new PadsModule(messageSender),
    presentations: new PresentationsModule(messageSender),
    slides: new SlidesModule(messageSender),
    'current-poll': new CurrentPollModule(messageSender),
    'current-user': new CurrentUserModule(messageSender),
    'external-video-meetings': new ExternalVideoMeetingsModule(messageSender),
    'group-chat': chatModule,
    'group-chat-msg': chatModule,
    'users-typing': chatModule,

    // ** meteor Collections **//
    // Screenreader-alert:
    // annotations:
    // audio-captions:
    // auth-token-validation:
    // breakouts:
    // breakouts-history:
    // captions:
    // connection-status:
    // current-poll:
    // group-chat:
    // group-chat-msg:
    // guestUsers:
    // layout-meetings:
    // meeting-time-remaining:
    // notifications:
    // pads:
    // pads-sessions:
    // pads-updates:
    // presentation-pods:
    // presentation-upload-token:
    // presentations:
    // record-meetings:
    // screenshare:
    // slide-positions:
    // slides:
    // users-infos:
    // users-persistent-data:
    // users-settings:
    // users-typing:
    // video-streams:
    // voiceCallStates:
    // whiteboard-multi-user:
  };

  Object.keys(modules).forEach((module) => {
    modules[module].onConnected();
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

    Object.keys(modules).forEach((module) => {
      modules[module].onDisconnectedBeforeWebsocketClose();
    });

    ws.close(0);
  }

  if (Object.keys(meetingData).length) {
    fetch(meetingData.logoutUrl);
  }
};

const SocketConnectionComponent = () => {
  const [joinUrl, setJoinUrl] = useState('');
  const [meetingData, setMeetingData] = useState({});
  const [websocket, setWebsocket] = useState(null);
  const modules = useRef({});
  const validateReqId = useRef(null);

  const onOpen = () => {};
  const onClose = () => {
    console.log(`Main websocket connection closed.`);

    tearDownModules(websocket, modules.current);
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
      logout(websocket, meetingData);
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
      const ws = makeWS(joinUrl);

      ws.onopen = onOpen;
      ws.onclose = onClose;
      ws.onmessage = (msg) => onMessage(ws, msg);

      setWebsocket(ws);
    }
  }, [joinUrl, meetingData]);

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
        } else {
          // Probably dealing with a module makeCall/method response
          if (msgObj.collection) {
            const currentModule = modules.current[msgObj.collection];
            if (currentModule) {
              currentModule.processMessage(msgObj);
            }
          } else {
            Object.values(modules.current).forEach(module => {
              module.processMessage(msgObj);
            });
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
    Object.keys(modules).forEach((module) => {
      modules[module].onDisconnected();
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

export default SocketConnectionComponent;
