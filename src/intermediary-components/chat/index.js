import React from 'react';
import { FlatList } from 'react-native';
import Styled from './styles';

const Item = (props) => {
  const { messageObject } = props;
  return (
    <>
      <Styled.MessageAuthor>{messageObject.item.author}</Styled.MessageAuthor>
      <Styled.Card>
        <Styled.MessageContent>
          {messageObject.item.message}
        </Styled.MessageContent>
      </Styled.Card>
    </>
  );
};

const Chat = (props) => {
  const { messages } = props;

  const renderItem = (item) => <Item messageObject={item} />;

  return <Styled.FlatList data={messages} renderItem={renderItem} />;
};

export default Chat;
