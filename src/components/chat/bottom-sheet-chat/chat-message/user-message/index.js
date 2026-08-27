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
  moderator = false,
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
      <MessageCard highlighted={highlighted} onLongPress={onLongPress}>
        <Styled.MessageTopContainer>
          <Styled.MessageAuthor numberOfLines={1}>{senderName}</Styled.MessageAuthor>
          <Styled.MessageTimestamp moderator={moderator}>
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
      </MessageCard>
    </Styled.ContainerItem>
  );
};

export default UserMessage;
