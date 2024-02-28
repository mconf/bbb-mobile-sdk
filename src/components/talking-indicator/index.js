import { useSelector } from 'react-redux';
import Styled from './styles';

const TalkingIndicator = () => {
  const detailedInfo = useSelector((state) => state.layout.detailedInfo);
  const VoiceUsersCollection = useSelector(
    (state) => state.voiceUsersCollection.voiceUsersCollection
  );
  const callersTalking = Object.values(VoiceUsersCollection)
    .filter((call) => call.talking)
    .map((call) => ({ callerName: call.callerName, voiceUserId: call.voiceUserId }));

  if (detailedInfo) {
    return;
  }

  return (
    <Styled.Container>
      {callersTalking.map((userObj) => (
        <Styled.TextContainer key={userObj.voiceUserId}>
          <Styled.MicIcon />
          <Styled.Text numberOfLines={1}>{userObj.callerName}</Styled.Text>
        </Styled.TextContainer>
      ))}
    </Styled.Container>
  );
};

export default TalkingIndicator;
