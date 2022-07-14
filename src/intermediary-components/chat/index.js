import React from 'react';
import Styled from './styles';

const Chat = (props) => {
  const { messages } = props;

  return messages.map((messageObject) => (
    <>
      <Styled.MessageAuthor>{messageObject.author}</Styled.MessageAuthor>
      <Styled.Card>
        <Styled.MessageContent>{messageObject.message}</Styled.MessageContent>
      </Styled.Card>
    </>
  ));
};

export default Chat;
