import { useTranslation } from 'react-i18next';
import HTMLView from 'react-native-htmlview';
import MessageReactions from '../message-reactions';
import RepliedMessage from './replied-message';
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
  editedAt,
  deletedAt,
  deletedByName,
  message,
  replyToMessage,
  reactions,
  currentUserId,
  reactionsEnabled,
  highlighted,
  onToggleReaction,
  onLongPress,
  onPressReplied,
}) => {
  const { t } = useTranslation();
  const timestamp = new Date(createdAt);
  const isDeleted = !!deletedAt;

  return (
    <Styled.ContainerItem>
      <Styled.UserAvatar
        userName={senderName}
        userRole={senderRole}
        userColor={userColor}
        userId={senderId}
        userImage={userImage}
      />
      {/* A deleted message has no actions left, so it does not take the hold. */}
      <Styled.Card
        highlighted={highlighted}
        disabled={isDeleted}
        onLongPress={isDeleted ? undefined : onLongPress}
      >
        <Styled.MessageTopContainer>
          <Styled.MessageAuthor numberOfLines={1}>{senderName}</Styled.MessageAuthor>
          <Styled.MessageTimestamp>
            {`${String(timestamp.getHours()).padStart(2, '0')}:${String(
              timestamp.getMinutes()
            ).padStart(2, '0')}`}
          </Styled.MessageTimestamp>
        </Styled.MessageTopContainer>
        {isDeleted ? (
          <Styled.DeletedMessage>
            {/* deletedBy is a relation to a user row that may already be gone */}
            {deletedByName
              ? t('mobileSdk.chat.deletedMessage', { userName: deletedByName })
              : t('mobileSdk.chat.deletedMessageNoAuthor')}
          </Styled.DeletedMessage>
        ) : (
          <>
            {!!replyToMessage && (
              <RepliedMessage
                authorName={replyToMessage.user?.name}
                authorColor={replyToMessage.user?.color}
                message={replyToMessage.message}
                deletedAt={replyToMessage.deletedAt}
                deletedByName={replyToMessage.deletedBy?.name}
                onPress={onPressReplied}
                onLongPress={onLongPress}
              />
            )}
            {handleMessage(message, onLongPress)}
            {!!editedAt && (
              <Styled.EditedLabel>
                <Styled.EditedIcon />
                <Styled.EditedText>{t('app.chat.toolbar.edit.edited')}</Styled.EditedText>
              </Styled.EditedLabel>
            )}
            <MessageReactions
              reactions={reactions}
              currentUserId={currentUserId}
              reactionsEnabled={reactionsEnabled}
              onToggleReaction={onToggleReaction}
            />
          </>
        )}
      </Styled.Card>
    </Styled.ContainerItem>
  );
};

export default UserMessage;
