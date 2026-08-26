import { View } from 'react-native';
import SystemMessage from './system-message';
import UserMessage from './user-message';
import Styled from './styles';

const ChatMessage = ({ item }) => {
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
          message={item.message}
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
