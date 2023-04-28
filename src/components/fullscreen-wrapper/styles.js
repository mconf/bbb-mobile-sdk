import styled from 'styled-components/native';
import { RTCView } from 'react-native-webrtc';
import button from '../button';
import Colors from '../../constants/colors';
import iconButton from '../icon-button';
import contentArea from '../content-area';

const Container = styled.View`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  background-color: #000000;
`;

const Wrapper = styled.View`
  background-color: #000000;
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const VideoStream = styled(RTCView)`
  width: 100%;
  height: 100%;
  overflow: hidden;
  object-fit: contain;
`;

const ConfirmButton = styled(button)`
  background-color: ${Colors.blue};
  color: ${Colors.white};
  font-size: 16px;
  font-weight: 400;
  padding: 12px;
  border-radius: 8px;
`;

const UserAvatar = styled.Image`
  width: 95%;
  height: 95%;
  border-radius: 16px;
  overflow: hidden;
`;

const UserColor = styled.View`
  width: 95%;
  height: 95%;
  margin: 16px;
  border: ${Colors.white} solid 2px;
  border-radius: 8px;
  background-color: ${({ userColor }) => userColor};
  overflow: hidden;
`;

const ContentArea = styled(contentArea)`
  background-color: none;
`;

const CloseFullscreenButton = styled(iconButton)`
  position: absolute;
  top: 12px;
  right: 12px
  opacity: 0.7;
`;

export default {
  VideoStream,
  ConfirmButton,
  Container,
  Wrapper,
  UserAvatar,
  UserColor,
  CloseFullscreenButton,
  ContentArea,
};
