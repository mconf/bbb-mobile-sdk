import styled from 'styled-components/native';
import { RTCView } from '@livekit/react-native-webrtc';
import { View } from 'react-native';
import Colors from '../../../../constants/colors';

const VideoStream = styled(RTCView)`
  position: relative;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: ${Colors.contentLetterboxColor};

  ${({ isGrid }) => isGrid && `
    object-fit: cover;
  `};
`;

const VideoSkeleton = () => (
  <View style={{ backgroundColor: Colors.contentLetterboxColor, height: '100%', width: '100%' }} />
);

export default {
  VideoStream,
  VideoSkeleton,
};
