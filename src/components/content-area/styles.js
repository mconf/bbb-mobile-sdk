import styled from 'styled-components/native';
import { css } from 'styled-components';
import { MaterialIcons } from '@expo/vector-icons';
import { TouchableRipple } from 'react-native-paper';
import presentation from '../presentation';
import screenshare from '../screenshare';
import Pressable from '../pressable';
import Settings from '../../../settings.json';

const Presentation = styled(presentation)``;
const Screenshare = styled(screenshare)``;
const ContentAreaPressable = styled.View`
  height: 100%;
  width: 100%;
  border-color: #06172A;
  border-width: 2px;
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

const IconContainerFullscreen = styled(TouchableRipple)`
  background-color: #28282d99;
  margin: 5px;
  padding: 8px;
  border-radius: 4px;
  position: absolute;
  right: 35px;
  z-index: 10;
`;

const IconContainerMinimize = styled(TouchableRipple)`
  background-color: #28282d99;
  margin: 5px;
  padding: 8px;
  border-radius: 4px;
  position: absolute;
  right: 0px;
  z-index: 10;
`;

const IconContainerPiP = styled(TouchableRipple)`
  background-color: #28282d99;
  margin: 5px;
  padding: 8px;
  border-radius: 4px;
  position: absolute;
  right: 70px;
  z-index: 10;
`;

const FullscreenIcon = ({ onPress, isScreensharing }) => (
  <IconContainerFullscreen onPress={onPress}>
    <MaterialIcons name={isScreensharing ? 'fullscreen' : Settings.whiteboard ? 'draw' : ''} size={16} color="#FFFFFF" />
  </IconContainerFullscreen>
);

const MinimizeIcon = ({ onPress }) => (
  <IconContainerMinimize onPress={onPress}>
    <MaterialIcons name="close" size={16} color="#FFFFFF" />
  </IconContainerMinimize>
);

const PIPIcon = ({ onPress }) => (
  <IconContainerPiP onPress={onPress}>
    <MaterialIcons name="picture-in-picture" size={16} color="#FFFFFF" />
  </IconContainerPiP>
);

export default {
  Presentation,
  Screenshare,
  ContentAreaPressable,
  PressableButton,
  FullscreenIcon,
  PIPIcon,
  MinimizeIcon
};
