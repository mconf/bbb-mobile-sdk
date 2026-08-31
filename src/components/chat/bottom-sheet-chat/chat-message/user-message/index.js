import HTMLView from 'react-native-htmlview';
import Styled from './styles';

const handleMessage = (message) => {
  if ((/<a\b[^>]*>/.test(message))) {
    return (
      <HTMLView value={message} />
    );
  }
  return (
    <Styled.MessageContent selectable>
      {message}
    </Styled.MessageContent>
  );
};

const UserMessage = ({
  senderName, senderRole, userColor, senderId, userImage, createdAt, message, moderator = false,
}) => {
  const timestamp = new Date(createdAt);
  const MessageCard = moderator ? Styled.OrangeCard : Styled.Card;

  return (
    <Styled.ContainerItem>
      <Styled.UserAvatar
        userName={senderName}
        userRole={moderator ? 'MODERATOR' : senderRole}
        userColor={userColor}
        userId={senderId}
        userImage={userImage}
      />
      <MessageCard>
        <Styled.MessageTopContainer>
          <Styled.MessageAuthor selectable>{senderName}</Styled.MessageAuthor>
          <Styled.MessageTimestamp moderator={moderator}>
            {`${String(timestamp.getHours()).padStart(2, '0')}:${String(
              timestamp.getMinutes()
            ).padStart(2, '0')}`}
          </Styled.MessageTimestamp>
        </Styled.MessageTopContainer>
        {handleMessage(message)}
      </MessageCard>
    </Styled.ContainerItem>
  );
};

export default UserMessage;
