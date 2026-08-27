import HTMLView from 'react-native-htmlview';
import MessageReactions from '../message-reactions';
import Styled from './styles';

const handleMessage = (message, onLongPress) => {
  if ((/<a\b[^>]*>/.test(message))) {
    // the anchors take the touch themselves, so the card never sees the hold
    return (
      <HTMLView value={message} onLinkLongPress={onLongPress} />
    );
  }
  return (
    <Styled.MessageContent>
      {message}
    </Styled.MessageContent>
  );
};

const UserMessage = ({
  senderName,
  senderRole,
  userColor,
  senderId,
  userImage,
  createdAt,
  message,
  reactions,
  currentUserId,
  reactionsEnabled,
  highlighted,
  onToggleReaction,
  onLongPress,
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
      <Styled.Card highlighted={highlighted} onLongPress={onLongPress}>
        <Styled.MessageTopContainer>
          <Styled.MessageAuthor numberOfLines={1}>{senderName}</Styled.MessageAuthor>
          <Styled.MessageTimestamp>
            {`${String(timestamp.getHours()).padStart(2, '0')}:${String(
              timestamp.getMinutes()
            ).padStart(2, '0')}`}
          </Styled.MessageTimestamp>
        </Styled.MessageTopContainer>
        {handleMessage(message, onLongPress)}
        <MessageReactions
          reactions={reactions}
          currentUserId={currentUserId}
          reactionsEnabled={reactionsEnabled}
          onToggleReaction={onToggleReaction}
        />
      </Styled.Card>
    </Styled.ContainerItem>
  );
};

export default UserMessage;
