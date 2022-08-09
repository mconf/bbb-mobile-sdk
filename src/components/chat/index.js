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
