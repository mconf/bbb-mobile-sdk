import { View } from 'react-native';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { trigDetailedInfo } from '../../../../store/redux/slices/wide-app/layout';
import ActivityBar from '../../../../components/activity-bar';
import Styled from './styles';

const PreviousPollCard = (props) => {
  const { pollObj } = props;
  const timestamp = new Date(parseInt(pollObj.id.split('/')[2], 10));
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const noPollLocale = pollObj?.questionType === 'CUSTOM' || pollObj?.questionType === 'R-';

  const renderAnswers = () => (
    pollObj.answers.map((answer) => (
      <View key={answer.id}>
        <Styled.AnswerContainer>
          <Styled.LabelContainer>
            <Styled.KeyText>
              {(pollObj.numResponders === 0
                ? 0
                : (answer.numVotes / pollObj.numResponders) * 100).toFixed(0)}
              %
            </Styled.KeyText>
            <Styled.KeyText>
              {noPollLocale ? answer.key : t(`app.poll.answer.${answer.key}`.toLowerCase())}
            </Styled.KeyText>
          </Styled.LabelContainer>
          <ActivityBar
            width={`${pollObj.numResponders === 0
              ? 0
              : (((answer.numVotes / pollObj.numResponders) * 100).toFixed(0))}%`}
          />
        </Styled.AnswerContainer>
      </View>
    ))
  );

  return (
    <View>
      <Styled.ContainerPollCard onPress={() => dispatch(trigDetailedInfo())}>
        <Styled.QuestionText>
          {pollObj.questionText === ''
            ? t('mobileSdk.poll.noQuestionTextProvided')
            : pollObj.questionText}
        </Styled.QuestionText>
        {renderAnswers()}
        <Styled.CustomDivider />
        <Styled.PollInfoLabelContainer>
          <Styled.PollInfoText>{`${pollObj.numResponders} / ${pollObj.numRespondents}`}</Styled.PollInfoText>
          <Styled.PollInfoText>
            {`${String(timestamp.getHours()).padStart(2, '0')}:${String(
              timestamp.getMinutes()
            ).padStart(2, '0')}`}
          </Styled.PollInfoText>
        </Styled.PollInfoLabelContainer>
        <Styled.BlankSpaceForButton />
      </Styled.ContainerPollCard>
      <Styled.PressableButton>{t('mobileSdk.poll.previousPolls.publishedLabel')}</Styled.PressableButton>
    </View>
  );
};

export default PreviousPollCard;
