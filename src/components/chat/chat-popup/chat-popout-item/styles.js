import styled, { css } from 'styled-components/native';
import Pressable from '../../../pressable';

const ContainerPressable = styled(Pressable).attrs(() => ({
  pressStyle: {
    opacity: 0.8,
  },
}))`
    ${() => css`
      position: absolute;
      background-color: #000000aa;
      padding: 12px;
      margin-right: 12px;
      left: 20px;
      border-radius: 8px;
      bottom: 20%;
    `}
  `;

const ContainerText = styled.View`

`;
const TextContainer = styled.View`
  padding: 8px;
`;
const UserNameText = styled.Text`
  font-size: 12px;
  color: white;
  font-weight: 700;
`;
const UserMessage = styled.Text`
  font-size: 12px;
  color: white;
`;

export default {
  ContainerPressable,
  ContainerText,
  UserMessage,
  UserNameText,
  TextContainer
};
