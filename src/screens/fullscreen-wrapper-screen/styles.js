import styled, { css } from 'styled-components/native';
import { RTCView } from 'react-native-webrtc';
import contentArea from '../../components/content-area';
import Pressable from '../../components/pressable';
import IconButtonComponent from '../../components/icon-button';

const Container = styled.View`
width: 100%;
height: 100%;
display: flex;
justify-content: space-between;

${({ orientation }) => orientation === 'LANDSCAPE'
  && `
  flex-direction: row;
  justify-content: center;
`}
`;

const Wrapper = styled.View`
  width: 100%;
  height: 100%;
`;

const UserAvatar = styled.Image`
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const ContentArea = styled(contentArea)``;

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

const VideoStream = styled(RTCView)`
  width: 100%;
  height: 100%;
  overflow: hidden;
  object-fit: contain;
`;

const FullscreenIcon = styled(IconButtonComponent)`
  padding: 0;
  margin: 0;
`;

export default {
  Container,
  Wrapper,
  UserAvatar,
  UserColor,
  ContentArea,
  PressableButton,
  FullscreenIcon,
  VideoStream
};
