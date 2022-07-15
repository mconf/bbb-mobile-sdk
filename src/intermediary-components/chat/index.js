import React from 'react';
import Styled from './styles';

const Chat = (props) => {
  const { messages } = props;

  return messages.map((messageObject) => (
    <React.Fragment key={messageObject.author + messageObject.message}>
      <Styled.MessageAuthor>{messageObject.author}</Styled.MessageAuthor>
      <Styled.Card>
        <Styled.MessageContent>{messageObject.message}</Styled.MessageContent>
      </Styled.Card>
    </React.Fragment>
  ));
};

export default Chat;
