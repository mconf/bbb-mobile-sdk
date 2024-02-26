import styled from 'styled-components/native';
import { StyleSheet } from 'react-native';
import userAvatar from '../../user-avatar';
import textInput from '../../text-input';
import Colors from '../../../constants/colors';

const Card = styled.View`
  padding: 8px;
`;

const FlatList = styled.FlatList`
  width: 100%;
`;

const MessageAuthor = styled.Text`
  color: ${Colors.lightGray400};
  font-weight: 500;
`;

const MessageTopContainer = styled.View`
  display: flex;
  flex-direction: row;
`;

const MessageTimestamp = styled.Text`
  color: ${Colors.lightGray200};
  padding-left: 8px;
  font-style: italic;
`;

const NoMessageText = styled.Text`
  font-size: 24px;
  text-align: center;
  padding: 8px;
`;

const UserAvatar = styled(userAvatar)`
  padding-top: 30px;
`;

const MessageContent = styled.Text`
  color: ${Colors.lightGray300};
`;

const ContainerItem = styled.View`
  display: flex;
  flex-direction: row;
  width: 90%;
  padding: 12px;
`;

const Container = styled.View`
  position: absolute;
  width: 100%;
  height: 100%;
  bottom: 0;
`;

const SendMessageContainer = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 8px 8px 32px 8px;
`;

const TextInput = styled(textInput)`
  width: 85%;
`;

// ? Rotate 180 degrees using transform, workaround for bug in Android 13
const styles = StyleSheet.create({
  list: {
    transform: [{ rotate: '180deg' }],
  },
  item: {
    transform: [{ rotate: '180deg' }],
  },
});

export default {
  Card,
  FlatList,
  UserAvatar,
  ContainerItem,
  MessageAuthor,
  MessageContent,
  Container,
  SendMessageContainer,
  TextInput,
  MessageTimestamp,
  MessageTopContainer,
  NoMessageText,
  styles
};
