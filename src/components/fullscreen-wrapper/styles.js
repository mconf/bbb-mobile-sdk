import styled, { css } from 'styled-components/native';
import { RTCView } from 'react-native-webrtc';
import button from '../button';
import Colors from '../../constants/colors';
import contentArea from '../content-area';
import Pressable from '../pressable';
import IconButtonComponent from '../icon-button';

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
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const ContentArea = styled(contentArea)`
  background-color: none;
`;

const UserAvatarComponent = styled(UserAvatar)``;

const UserColor = styled.View`
  width: 100%;
  height: 100%;
  background-color: ${({ userColor }) => `${userColor}AA`};
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PressableButton = styled(Pressable).attrs(() => ({
  pressStyle: {
    opacity: 0.8,
  },
}))`
  ${() => css`
    background-color: #28282d99;
    margin: 5px;
    border-radius: 4px;
    position: absolute;
    right: 0;
  `}
`;

const FullscreenIcon = styled(IconButtonComponent)`
  padding: 0;
  margin: 0;
`;

export default {
  VideoStream,
  ConfirmButton,
  Container,
  Wrapper,
  UserAvatar,
  UserColor,
  ContentArea,
  UserAvatarComponent,
  PressableButton,
  FullscreenIcon
};
