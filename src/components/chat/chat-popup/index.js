import Styled from './styles';

const ChatPopup = (props) => {
  const { userName, userText, onPress } = props;

  return (
    <Styled.ContainerPressable onPress={onPress}>
      <Styled.TextContainer>
        <Styled.UserNameText>
          {userName}
        </Styled.UserNameText>
        <Styled.UserMessage>
          {userText}
        </Styled.UserMessage>
      </Styled.TextContainer>
    </Styled.ContainerPressable>
  );
};

export default ChatPopup;
