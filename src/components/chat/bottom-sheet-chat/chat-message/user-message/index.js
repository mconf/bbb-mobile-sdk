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
  senderName, senderRole, userColor, senderId, userImage, createdAt, message,
}) => {
  const timestamp = new Date(createdAt);
  return (
    <Styled.ContainerItem>
      <Styled.UserAvatar
        userName={senderName}
        userRole={senderRole}
        userColor={userColor}
        userId={senderId}
        userImage={userImage}
      />
      <Styled.Card>
        <Styled.MessageTopContainer>
          <Styled.MessageAuthor selectable>{senderName}</Styled.MessageAuthor>
          <Styled.MessageTimestamp>
            {`${String(timestamp.getHours()).padStart(2, '0')}:${String(
              timestamp.getMinutes()
            ).padStart(2, '0')}`}
          </Styled.MessageTimestamp>
        </Styled.MessageTopContainer>
        {handleMessage(message)}
      </Styled.Card>
    </Styled.ContainerItem>
  );
};

export default UserMessage;
