import { useSelector } from 'react-redux';
import Styled from './styles';

const TalkingIndicator = () => {
  const VoiceUsersCollection = useSelector(
    (state) => state.voiceUsersCollection.voiceUsersCollection
  );
  const callersTalking = Object.values(VoiceUsersCollection)
    .filter((call) => call.talking)
    .map((call) => call.callerName);

  return (
    <Styled.Container>
      {callersTalking.map((userName) => (
        <Styled.TextContainer>
          <Styled.MicIcon />
          <Styled.Text>{userName}</Styled.Text>
        </Styled.TextContainer>
      ))}
    </Styled.Container>
  );
};

export default TalkingIndicator;
