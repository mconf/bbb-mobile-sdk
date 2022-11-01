import ContentLoader, { Rect } from 'react-content-loader/native';
import { RTCView } from 'react-native-webrtc';
import styled from 'styled-components/native';
import Colors from '../../constants/colors';

const ScreenshareSkeleton = () => (
  <ContentLoader
    speed={1}
    width="100%"
    height="100%"
    viewBox="0 0 160 90"
    backgroundColor="#6e6e6e"
    foregroundColor="#505050"
  >
    <Rect x="0" y="0" rx="3" ry="3" width="160" height="90" />
  </ContentLoader>
);

const ScreenshareStream = styled(RTCView)`
  width: 100%;
  height: 100%;
  overflow: hidden;
  object-fit: contain;
  background-color: ${Colors.contentLetterboxColor};
`;

export default { ScreenshareSkeleton, ScreenshareStream };
