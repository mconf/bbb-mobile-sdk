import HTMLView from 'react-native-htmlview';
import Styled from './styles';

const ChatPopupItem = (props) => {
  const { userName, userText, onPress } = props;

  const renderMessage = (message) => {
    if (/<a\b[^>]*>/.test(message)) {
      return <HTMLView value={message} />;
    }
    return <Styled.UserMessage numberOfLines={1}>{message}</Styled.UserMessage>;
  };

  return (
    <Styled.ContainerPressable onPress={onPress}>
      <Styled.TextContainer>
        <Styled.AuthorContainer>
          <Styled.ChatIcon />
          <Styled.UserNameText numberOfLines={1}>
            {userName}
          </Styled.UserNameText>
        </Styled.AuthorContainer>
        {renderMessage(userText)}
      </Styled.TextContainer>
    </Styled.ContainerPressable>
  );
};

export default ChatPopupItem;
