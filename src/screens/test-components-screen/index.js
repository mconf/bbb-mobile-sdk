import React from 'react';
import { SafeAreaView } from 'react-native';
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStream,
  MediaStreamTrack,
  mediaDevices,
  registerGlobals,
} from 'react-native-webrtc';

import Styled from './styles';

import SocketConnection from '../../components/socket-connection';
const configuration = { iceServers: [{ url: 'stun:stun.l.google.com:19302' }] };
const pc = new RTCPeerConnection(configuration);

let isFront = true;
mediaDevices.enumerateDevices().then((sourceInfos) => {
  console.log(sourceInfos);
  let videoSourceId;
  for (let i = 0; i < sourceInfos.length; i++) {
    const sourceInfo = sourceInfos[i];
    if (
      sourceInfo.kind == 'videoinput' &&
      sourceInfo.facing == (isFront ? 'front' : 'environment')
    ) {
      videoSourceId = sourceInfo.deviceId;
    }
  }
  mediaDevices
    .getUserMedia({
      audio: true,
      video: {
        width: 640,
        height: 480,
        frameRate: 30,
        facingMode: isFront ? 'user' : 'environment',
        deviceId: videoSourceId,
      },
    })
    .then((stream) => {
      // Got stream!
    })
    .catch((error) => {
      // Log error
    });
});

pc.createOffer().then((desc) => {
  pc.setLocalDescription(desc).then(() => {
    // Send pc.localDescription to peer
  });
});

pc.onicecandidate = function (event) {
  // send event.candidate to peer
};

const TestComponentsScreen = () => (
  <SafeAreaView>
    <Styled.ContainerView>
      <SocketConnection />
    </Styled.ContainerView>
  </SafeAreaView>
);

export default TestComponentsScreen;
