import styled from 'styled-components/native';
import { css } from 'styled-components';
import presentation from '../presentation';
import screenshare from '../screenshare';
import Pressable from '../pressable';

const Presentation = styled(presentation)``;
const Screenshare = styled(screenshare)``;
const ContentAreaPressable = styled(Pressable).attrs(() => ({
  pressStyle: {
    opacity: 0.8,
  },
}))`
  ${() => css`
    width: 100%;
  `}
`;

export default {
  Presentation,
  Screenshare,
  ContentAreaPressable
};
