import styled from 'styled-components/native';
import { css } from 'styled-components';
import { RTCView } from 'react-native-webrtc';
import ContentLoader, { Rect } from 'react-content-loader/native';
import Colors from '../../../constants/colors';
import Pressable from '../../pressable';

const ContainerPressable = styled(Pressable).attrs(() => ({
  pressStyle: {
    opacity: 0.8,
    borderWidth: 2,
  },
}))`
  ${() => css`
    height: 120px;
    width: 120px;
    border-color: ${Colors.white};
    border-width: 2px;
    ${({ isTalking }) => isTalking && `
      border: 2px ${Colors.orange} solid;
    `}
    ${({ isGrid }) => isGrid && `
      border-color: #06172A;
    `}
  `}
`;

const UserAvatar = styled.Image`
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const VideoStream = styled(RTCView)`
  position: relative;
  width: 100%;
  height: 100%;
  // overflow: hidden;
  object-fit: contain;
  background-color: ${Colors.contentLetterboxColor};

  ${({ isGrid }) => isGrid && `
    object-fit: cover;
  `}
`;

const UserColor = styled.View`
  width: 100%;
  height: 100%;
  background-color: ${({ userColor, isGrid }) => userColor + (isGrid && 'AA')};
  overflow: hidden;

  ${({ isGrid }) => isGrid && `
    display: flex;
    align-items: center;
    justify-content: center;
  `}
`;

const NameLabelContainer = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  background-color: #28282d99;
  padding: 5px;
  margin: 5px;
  border-radius: 4px;
`;
const NameLabel = styled.Text`
  color: ${Colors.white};
`;

const PressableButton = styled(Pressable).attrs(() => ({
  pressStyle: {
    opacity: 0.8,
  },
}))`
  ${() => css`
    flex-direction: row;
    width: 100%;
    border: 6px solid #ffffff00;
    background-color: #28282d99;
    border-radius: 8px;
    position: absolute;
    align-items: center;
  `}
`;

const VideoSkeleton = () => (
  <ContentLoader
    speed={1}
    width="100%"
    height="100%"
    viewBox="0 0 90 90"
    backgroundColor={Colors.contentLetterboxColor}
    foregroundColor={Colors.contentForegroundColor}
  >
    <Rect x="0" y="0" rx="3" ry="3" width="90" height="90" />
  </ContentLoader>
);

const ContainerPressableGrid = styled(Pressable).attrs(() => ({
  pressStyle: {
    borderWidth: 2,
  },
}))`
  ${() => css`
    height: 120px;
    width: 120px;
    border-color: #06172A;
    border-width: 2px;
    ${({ isTalking }) => isTalking && `
      border: 2px ${Colors.orange} solid;
    `}
  `}
`;

export default {
  ContainerPressable,
  UserAvatar,
  NameLabel,
  NameLabelContainer,
  PressableButton,
  UserColor,
  VideoStream,
  VideoSkeleton,
  ContainerPressableGrid
};
