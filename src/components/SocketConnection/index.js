const sendMessage = (ws, msgObject) => {
  const msg = JSON.stringify([msgObject]);
  ws.send(msg);
}

const sendConnectMsg = (ws) => {
  sendMessage({msg: 'connect', version: '1', support: ["1", "pre2", "pre1"]});
};

const sendValidationMsg = (ws) => {

}

const processMessages = (ws) => {

};

const makeEnterUrl = (joinUrl) => {
  const url = new URL(joinUrl);
  const params = new URLSearchParams(url.search);

  return `${url.protocol}//${url.host}/bigbluebutton/api/enter?sessionToken=${params.get('sessionToken')}`;
};

const makeWS = (joinUrl) => {
  const wsUrl = `wss://${url.host}/html5client/sockjs/123/abcdefgh/websocket`;

  const ws = new WebSocket(wsUrl);
};

const getMeetingData = async (joinUrl) => {
  const joinResp = await fetch(joinUrl, {
    headers: {
      'Set-Cookie': '',
    }
  });

  console.log('----');
  console.log(joinResp.headers);
  console.log('----');

  const html5join = joinResp.url;
  // should be here, but it's not
  const cookie = joinResp.headers['Set-Cookie']['SESSIONID'];

  const enterResp = await fetch(makeEnterUrl(html5join), {
    headers: {
      cookies: `SESSIONID=${cookie}`,
    }
  });

  console.log(enterResp);

  return enterResp.body;
};

import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import TextInput from '../TextInput';

import 'react-native-url-polyfill/auto';

const SocketConnectionComponent = (props) => {
  const [joinUrl, setJoinUrl] = useState('');
  const [meetingData, setMeetingData] = useState({});

  useEffect(() => {
    async function getData() {
      if (!joinUrl.length) {
        return;
      }

      console.log("get data");
      const resp = await getMeetingData(joinUrl);
      console.log(resp);
      setMeetingData(resp);
    };
    getData();
  }, [joinUrl]);

  // const meetingData = await getMeetingData(joinUrl)

  // const { meetingID, internalUserID, authToken } = meetingData;

  // const ws = makeWS(joinUrl);

  // conectar ao socket
  // sendConnectMsg(ws);
  // echo.'["{.\"msg\":.\"connect\",.\"version\":.\"1\",.\"support\":.[\"1\",.\"pre2\",.\"pre1\"].}"]'
  //
  // responder aos pong
  // echo.'["{.\"msg\":.\"pong\".}"]'
  //
  // Conectar no socket da meeting
  // echo.'["{\"msg\":.\"method\",.\"method\":.\"validateAuthToken\",.\"id\":.\"0123456789abcdef0123456789abcdef\",
  // \"params\":.[\"'$MEETING_ID'\",.\"'$USER_ID'\",.\"'$AUTH_TOKEN'\".].}"]'
  //
  // subscribe na coleção de users
  // echo.'["{\"msg\":.\"sub\",.\"id\":.\"0123456789abcdefg\",.\"name\":.\"users\",.\"params\":.[].}"]'
  //


  return (
    <>
      <TextInput
      placeholder="Join URL"
      onChangeText={join => setJoinUrl(join)}
      defaultValue={joinUrl}
     />
      <Text>
        {JSON.stringify(meetingData)}
      </Text>
    </>
  )
};

export default SocketConnectionComponent;
