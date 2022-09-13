import Styled from './styles';

const Item = (props) => {
  const { messageObject } = props;
  const timestamp = new Date(messageObject.item.timestamp);
  return (
    <>
      <Styled.MessageTopContainer>
        <Styled.MessageAuthor>{messageObject.item.author}</Styled.MessageAuthor>
        <Styled.MessageTimestamp>
          {`${String(timestamp.getHours()).padStart(2, '0')}:${String(
            timestamp.getMinutes()
          ).padStart(2, '0')}`}
        </Styled.MessageTimestamp>
      </Styled.MessageTopContainer>
      <Styled.Card>
        <Styled.MessageContent>
          {messageObject.item.message}
        </Styled.MessageContent>
      </Styled.Card>
    </>
  );
};

const Chat = (props) => {
  const { messages, onPressItem } = props;
  // TODO review this after we get session chat
  const messagesInverted = messages.reverse();

  const renderItem = (item) => (
    <Styled.ChatContainerPressable onPress={onPressItem}>
      <Item messageObject={item} />
    </Styled.ChatContainerPressable>
  );

  return <Styled.FlatList data={messagesInverted} renderItem={renderItem} />;
};

export default Chat;
