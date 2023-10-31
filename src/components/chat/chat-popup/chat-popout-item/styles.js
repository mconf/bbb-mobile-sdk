import styled, { css } from 'styled-components/native';
import { Entypo } from '@expo/vector-icons';
import Pressable from '../../../pressable';

const ContainerPressable = styled(Pressable).attrs(() => ({
  pressStyle: {
    opacity: 0.8,
  },
}))`
    ${() => css`
      background-color: #000000aa;
      padding: 12px;
      border-radius: 8px;
      display: flex;
      flex-direction: row;
    `}
  `;

const ContainerText = styled.View`
`;

const AuthorContainer = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const ChatIcon = () => (
  <Entypo name="chat" size={10} color="white" style={{ paddingRight: 4 }} />
);

const TextContainer = styled.View`
  padding: 8px;
`;

const UserNameText = styled.Text`
  font-size: 12px;
  color: white;
  font-weight: 700;
  vertical-align: middle;
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
  TextContainer,
  ChatIcon,
  AuthorContainer
};
