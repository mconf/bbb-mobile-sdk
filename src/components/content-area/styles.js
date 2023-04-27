import styled from 'styled-components/native';
import { css } from 'styled-components';
import presentation from '../presentation';
import screenshare from '../screenshare';
import Colors from '../../constants/colors';
import Pressable from '../pressable';

const Presentation = styled(presentation)``;
const Screenshare = styled(screenshare)``;
const ContentAreaPressable = styled(Pressable).attrs(() => ({
  pressStyle: {},
}))`
  ${() => css`
  height: 100%;
  width: 100%;
  border-color: #06172A;
  border-width: 2px;
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

export default {
  Presentation,
  Screenshare,
  ContentAreaPressable,
  NameLabel,
  NameLabelContainer,
};
