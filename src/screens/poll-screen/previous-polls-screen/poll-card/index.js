import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Styled from './styles';

const PreviousPollCard = (props) => {
  const { pollObj } = props;
  const timestamp = new Date(parseInt(pollObj.id.split('/')[2], 10));
  const { t } = useTranslation();
  const isCustomPoll = pollObj.questionType === 'CUSTOM';

  return (
    <Styled.ContainerPollCard>
      <Styled.QuestionText>
        {pollObj.questionText === ''
          ? t('mobileSdk.poll.noQuestionTextProvided')
          : pollObj.questionText}
      </Styled.QuestionText>
      <Styled.TimestampText>
        {`${String(timestamp.getHours()).padStart(2, '0')}:${String(
          timestamp.getMinutes()
        ).padStart(2, '0')}`}
      </Styled.TimestampText>
      {pollObj.answers.map((answer) => (
        <View key={answer.id}>
          <Styled.AnswerContainer>
            <Styled.KeyText>
              {isCustomPoll ? answer.key : t(`app.poll.answer.${answer.key}`.toLowerCase())}
              {' '}
              :
              {' '}
            </Styled.KeyText>
            <Styled.KeyText>
              {(pollObj.numResponders === 0
                ? 0
                : (answer.numVotes / pollObj.numResponders) * 100).toFixed(0)}
              %
            </Styled.KeyText>
          </Styled.AnswerContainer>
        </View>
      ))}
    </Styled.ContainerPollCard>
  );
};

export default PreviousPollCard;
