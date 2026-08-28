import { View } from 'react-native';
import SystemMessage from './system-message';
import UserMessage from './user-message';
import Styled from './styles';

const ChatMessage = ({
  item,
  currentUserId,
  reactionsEnabled,
  highlighted,
  onOpenActions,
  onToggleReaction,
  onFocusMessage,
}) => {
  let content;

  switch (item.messageType) {
    case 'userIsPresenterMsg':
      content = (
        <SystemMessage
          icon="monitor"
          i18nKey="mobileSdk.chat.serverMsg"
          i18nValues={{ senderName: item.senderName }}
        />
      );
      break;
    case 'userAwayStatusMsg': {
      const away = JSON.parse(item.messageMetadata)?.away === true;
      content = (
        <SystemMessage
          icon="timer-outline"
          i18nKey={away ? 'mobileSdk.chat.away' : 'mobileSdk.chat.notAway'}
          i18nValues={{ senderName: item.senderName }}
        />
      );
      break;
    }
    case 'poll':
      content = (
        <SystemMessage
          icon="poll"
          i18nKey="mobileSdk.chat.pollPublishedMsg"
          i18nValues={{}}
        />
      );
      break;
    default:
      content = (
        <UserMessage
          senderName={item.senderName}
          senderRole={item.senderRole}
          userColor={item.user?.color}
          senderId={item.senderId}
          userImage={item.user?.avatar || null}
          createdAt={item.createdAt}
          editedAt={item.editedAt}
          deletedAt={item.deletedAt}
          deletedByName={item.deletedBy?.name}
          message={item.message}
          replyToMessage={item.replyToMessage}
          reactions={item.reactions}
          currentUserId={currentUserId}
          reactionsEnabled={reactionsEnabled}
          highlighted={highlighted}
          onLongPress={() => onOpenActions(item)}
          onToggleReaction={(reactionEmoji, reactedByMe) => onToggleReaction(
            item.messageId,
            reactionEmoji,
            reactedByMe
          )}
          onPressReplied={() => onFocusMessage(item.replyToMessage?.messageSequence)}
        />
      );
  }

  return (
    <View style={Styled.styles.item} key={item.timestamp}>
      {content}
    </View>
  );
};

export default ChatMessage;
