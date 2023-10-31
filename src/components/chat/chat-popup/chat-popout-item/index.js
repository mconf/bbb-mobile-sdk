import Styled from './styles';

const ChatPopupItem = (props) => {
  const { userName, userText, onPress } = props;

  return (
    <Styled.ContainerPressable onPress={onPress}>
      <Styled.TextContainer>
        <Styled.AuthorContainer>
          <Styled.ChatIcon />
          <Styled.UserNameText numberOfLines={1}>
            {userName}
          </Styled.UserNameText>
        </Styled.AuthorContainer>
        <Styled.UserMessage numberOfLines={1}>
          {userText}
        </Styled.UserMessage>
      </Styled.TextContainer>
    </Styled.ContainerPressable>
  );
};

export default ChatPopupItem;
