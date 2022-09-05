import { View } from 'react-native';
import Styled from './styles';

const PreviousPollCard = (props) => {
  const { pollObj } = props;

  return (
    <Styled.ContainerPollCard>
      <Styled.QuestionText>{pollObj.questionText}</Styled.QuestionText>
      {pollObj.answers.map((answer) => (
        <View key={answer.id}>
          <Styled.AnswerContainer>
            <Styled.KeyText>{answer.key} : </Styled.KeyText>
            <Styled.KeyText>
              {((answer.numVotes / pollObj.numResponders) * 100).toFixed(0)}%
            </Styled.KeyText>
          </Styled.AnswerContainer>
        </View>
      ))}
    </Styled.ContainerPollCard>
  );
};

export default PreviousPollCard;
