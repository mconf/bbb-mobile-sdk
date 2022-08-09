import {
  getRandomDigits,
  getRandomHex,
  getRandomAlphanumericWithCaps,
  getRandomAlphanumeric,
  decodeMessage
} from './utils';
import 'react-native-url-polyfill/auto';

import { UserModule } from './modules/user';
import { MeetingModule } from './modules/meeting';
import { ChatModule } from './modules/chat';

import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import TextInput from '../TextInput';

const sendMessage = (ws, msgObj) => {
  const msg = JSON.stringify(msgObj).replace(/"/g, '\\"');

  ws.send('[\"' + msg + '\"]');
};

const sendConnectMsg = (ws) => {
  sendMessage(ws, {msg: 'connect', version: '1', support: ["1", "pre2", "pre1"]});
};

const reAuthenticateUser = (ws) => {
  sendMessage(ws, {
    "msg": "sub",
    "id": getRandomAlphanumericWithCaps(17),
    "name": "current-user",
    "params": [],
  });
};

const sendValidationMsg = (ws, meetingData) => {
  const { meetingID, internalUserID, authToken } = meetingData;
  const msg = {
    msg: 'method',
    method: 'validateAuthToken',
    id: getRandomAlphanumeric(32),
    params: [ meetingID, internalUserID, authToken ],
  };

  sendMessage(ws, msg);
};

const Sender = (ws) => {
  return {
    subscribeMsg: (collection) => {
      const id = getRandomAlphanumeric(17);
      sendMessage(ws, {
        msg: "sub",
        id,
        name: collection,
        params: []
      });
      return id;
    },
    unsubscribeMsg: (collection, id) => {
      sendMessage(ws, {
        msg: "unsub",
        id,
      });
    },
    sendMessage,
  };
};

const makeWS = (joinUrl) => {
  const url = new URL(joinUrl);
  const wsUrl = `wss://${url.host}/html5client/sockjs/${getRandomDigits(3)}/${getRandomAlphanumeric(8)}/websocket`;

  return new WebSocket(wsUrl);
};

const makeEnterUrl = (joinUrl) => {
  const url = new URL(joinUrl);
  const params = new URLSearchParams(url.search);

  return `${url.protocol}//${url.host}/bigbluebutton/api/enter?sessionToken=${params.get('sessionToken')}`;
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

const processMessage = (ws, msgObj, meetingData, modules, setModules) => {
  console.log(msgObj);
  switch (msgObj.msg) {
    case "connected": {
      sendValidationMsg(ws, meetingData);
      break;
    }

    case "ping": {
      sendMessage(ws, {msg: 'pong'});
      break;
    }

    case "result": {
      setModules(setupModules(ws));
      break;
    }

    case "added": {
      const currentModule = modules[msgObj.collection];
      if (currentModule) {
        currentModule.add(msgObj.fields);
      }

      break;
    }

    case "removed": {
      const currentModule = modules[msgObj.collection];
      if (currentModule) {
        currentModule.remove(msgObj.id);
      }

      break;
    }

    case "changed": {
      const currentModule = modules[msgObj.collection];
      if (currentModule) {
        currentModule.update(msgObj.id, msgObj.fields);
      }

      break;
    }

    case "updated": {
      console.log("what to do with update");
      break;
    }
  }
}

/// Set up the web socket modules.
const setupModules = (ws) => {
  const messageSender = new Sender(ws);

  const chatModule = new ChatModule(messageSender);

  const modules = {
    users: new UserModule(messageSender),
    meetings: new MeetingModule(messageSender),
    // "ping": PingModule(messageSender),
    // "video": VideoModule(messageSender, _meetingInfo, userModule),
    // "user": userModule,
    "group-chat": chatModule,
    "group-chat-msg": chatModule,
    "users-typing": chatModule,
    // "presentation": PresentationModule(messageSender, _meetingInfo),
    // "poll": PollModule(messageSender),
    // "call": CallModule(messageSender, _meetingInfo, _provider),
    // "voiceUsers":
    //     VoiceUsersModule(messageSender, _meetingInfo, userModule, _provider),
    // "voiceCallState": VoiceCallStatesModule(messageSender, _provider),
  };

  for (var moduleName in modules) {
    if (modules.hasOwnProperty(moduleName)) {
      modules[moduleName].onConnected();
    }
  }

  return modules;
}

const tearDownModules = (ws) => {
  for (var moduleName in modules) {
    if (modules.hasOwnProperty(moduleName)) {
      modules[moduleName].onDisconnected();
    }
  }
};

const logout = (ws, meetingData, modules) => {
  if (ws) {
    sendMessage(ws, {
      msg: "method",
      method: "userLeftMeeting",
      params: [],
    });

    for (var moduleName in modules) {
      if (modules.hasOwnProperty(moduleName)) {
        modules[moduleName].onDisconnectedBeforeWebsocketClose();
      }
    }

    ws.close(0);
  }

  if (Object.keys(meetingData).length) {
    fetch(meetingData.logoutUrl);
  }
}

const SocketConnectionComponent = (props) => {
  const [joinUrl, setJoinUrl] = useState('');
  const [meetingData, setMeetingData] = useState({});
  const [websocket, setWebsocket] = useState(null);
  const [modules, setModules] = useState({});

  const onOpen = () => {};
  const onClose = (reason) => {
    console.log(`Main websocket connection closed.`);

    tearDownModules(websocket, modules);
  };

  const onMessage = (ws, event) => {
    let msg = event.data;

    if (msg == "o") {
      sendConnectMsg(ws);
    } else {
      if (msg.startsWith("a")) {
        msg = msg.substring(1, msg.length);
      }
      const msgObj = decodeMessage(msg);

      if (Object.keys(msgObj).length) {
        processMessage(ws, msgObj, meetingData, modules, setModules);
      }
    }

  };

  useEffect(() => {
    console.log("Component Will Mount");
    return () => {
      console.log("Component Will Unmount")
      logout(websocket, meetingData);
    }
  }, [])

  useEffect(() => {
    async function getData() {
      if (!joinUrl.length) {
        return;
      }

      const resp = await getMeetingData(joinUrl);
      setMeetingData(resp);
    };
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

  return (
    <View>
      <Text style={styles.data}>
        {JSON.stringify(meetingData)}
      </Text>
      {}
      <TextInput
        placeholder="Join URL"
        onChangeText={join => setJoinUrl(join)}
        defaultValue={joinUrl}
     />
    </View>
  )
};

const styles = StyleSheet.create({
  data : {
    color: 'white',
  },
});

export default SocketConnectionComponent;
