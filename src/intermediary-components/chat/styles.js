import styled from 'styled-components/native';

const Card = styled.View`
  background-color: #eef1f44d;
  border-radius: 20px;
  padding: 8px;
  margin: 8px;
`;

const MessageAuthor = styled.Text`
  color: white;
`;

const MessageContent = styled.Text`
  color: white;
`;

export default {
  Card,
  MessageAuthor,
  MessageContent,
};
