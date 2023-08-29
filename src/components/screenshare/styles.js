import { ActivityIndicator } from 'react-native-paper';
import { RTCView } from 'react-native-webrtc';
import styled from 'styled-components/native';
import Colors from '../../constants/colors';

const ScreenshareSkeleton = () => (
  <ActivityIndicator
    size="large"
    color="white"
    backgroundColor={Colors.contentLetterboxColor}
    animating="true"
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    }}
  />
);

const ScreenshareStream = styled(RTCView)`
  width: 100%;
  height: 100%;
  overflow: hidden;
  object-fit: contain;
  background-color: ${Colors.contentLetterboxColor};
`;

export default { ScreenshareSkeleton, ScreenshareStream };
