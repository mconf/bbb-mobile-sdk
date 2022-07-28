import styled from 'styled-components/native';

const Card = styled.View`
  background-color: #ffffff4d;
  border-radius: 20px;
  padding: 8px;
  margin: 8px;
`;

const FlatList = styled.FlatList`
  width: 100%;
`;

const MessageAuthor = styled.Text`
  color: white;
`;

const MessageContent = styled.Text`
  color: white;
`;

export default {
  Card,
  FlatList,
  MessageAuthor,
  MessageContent,
};
