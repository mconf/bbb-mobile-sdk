import styled from 'styled-components/native';
import { css } from 'styled-components';
import Colors from '../../constants/colors';
import Pressable from '../pressable';

const ButtonOuterContainer = styled.View`
  display: flex;
  margin: 4px;
`;

const ButtonInnerContainer = styled(Pressable).attrs(() => ({
  pressStyle: {
    opacity: 0.8,
  },
}))`
  ${() => css`
    justify-content: center;
    display: flex;
    border-radius: 40px;
  `}
`;

const ButtonText = styled.Text`
  color: ${Colors.white};
  text-align: center;
  font-size: 18px;
`;

const LoadingContainer = styled.View`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
`;

export default {
  ButtonOuterContainer,
  ButtonInnerContainer,
  ButtonText,
  LoadingContainer,
};
