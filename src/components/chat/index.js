import { useChatMsgs } from '../../hooks/selectors/chat/use-chat-msgs';
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
  const { onPressItem } = props;

  const messages = useChatMsgs();

  const messagesInvertedSliced = messages.reverse().slice(0, 5);

  const renderItem = (item) => (
    <Styled.ChatContainerPressable onPress={onPressItem}>
      <Item messageObject={item} />
    </Styled.ChatContainerPressable>
  );

  return <Styled.FlatList data={messagesInvertedSliced} renderItem={renderItem} />;
};

export default Chat;
