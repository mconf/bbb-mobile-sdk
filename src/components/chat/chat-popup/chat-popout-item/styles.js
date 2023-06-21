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
      border-radius: 8px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      bottom: 25%;
      left: 16px;
      max-width: 90%;
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
