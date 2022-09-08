import styled from 'styled-components/native';
import { css } from 'styled-components';
import Colors from '../../constants/colors';
import Pressable from '../pressable';

const Card = styled.View`
  background-color: #ffffff4d;
  border-radius: 20px;
  padding: 8px;
  margin: 8px;
`;

const MessageTopContainer = styled.View`
  display: flex;
  flex-direction: row;
`;

const MessageTimestamp = styled.Text`
  color: ${Colors.lightGray300};
  padding-left: 8px;
  font-style: italic;
`;

const FlatList = styled.FlatList`
  width: 100%;
`;

const MessageAuthor = styled.Text`
  color: ${Colors.white};
`;

const MessageContent = styled.Text`
  color: ${Colors.white};
`;

const ChatContainerPressable = styled(Pressable).attrs(() => ({
  pressStyle: {
    opacity: 0.8,
  },
}))`
  ${() => css``}
`;

export default {
  Card,
  FlatList,
  MessageAuthor,
  MessageContent,
  ChatContainerPressable,
  MessageTimestamp,
  MessageTopContainer,
};
