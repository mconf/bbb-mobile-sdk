import { View } from 'react-native';
import Styled from './styles';

const PreviousPollCard = (props) => {
  const { pollObj } = props;
  const timestamp = new Date(parseInt(pollObj.id.split('/')[2], 10));

  return (
    <Styled.ContainerPollCard>
      <Styled.QuestionText>{pollObj.questionText}</Styled.QuestionText>
      <Styled.TimestampText>
        {`${String(timestamp.getHours()).padStart(2, '0')}:${String(
          timestamp.getMinutes()
        ).padStart(2, '0')}`}
      </Styled.TimestampText>
      {pollObj.answers.map((answer) => (
        <View key={answer.id}>
          <Styled.AnswerContainer>
            <Styled.KeyText>{answer.key} : </Styled.KeyText>
            <Styled.KeyText>
              {(pollObj.numResponders == 0 ? 0 : (answer.numVotes / pollObj.numResponders) * 100).toFixed(0)}%
            </Styled.KeyText>
          </Styled.AnswerContainer>
        </View>
      ))}
    </Styled.ContainerPollCard>
  );
};

export default PreviousPollCard;
