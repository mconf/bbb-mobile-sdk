import styled from 'styled-components/native';
import { Dimensions } from 'react-native';
import { css } from 'styled-components';
import presentation from '../presentation';
import screenshare from '../screenshare';
import Colors from '../../constants/colors';
import Pressable from '../pressable';
import IconButtonComponent from '../icon-button';

const Presentation = styled(presentation)`
  width: 100%;
  height: 100%;
  ${({ fullscreen }) => fullscreen
    && `
      width: ${Dimensions.get('window').height - Dimensions.get('window').width / 4}px ;
      transform: rotate(90deg);
  `}
`;

const Screenshare = styled(screenshare)`
  width: 100%;
  height: 100%;
`;

const ContentAreaPressable = styled.View`
  height: 100%;
  width: 100%;
  border-color: #06172A;
  border-width: 2px;
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
  Presentation,
  Screenshare,
  ContentAreaPressable,
  NameLabel,
  NameLabelContainer,
  PressableButton,
  FullscreenIcon
};
