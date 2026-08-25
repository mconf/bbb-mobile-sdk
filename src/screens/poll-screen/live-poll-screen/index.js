import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenWrapper from '../../../components/screen-wrapper';
import useCurrentPoll from '../../../graphql/hooks/useCurrentPoll';
import Colors from '../../../constants/colors';
import PollCardStyled from '../previous-polls-screen/poll-card/styles';
import queries from '../queries';
import { answerLabel, typeLabel } from '../poll-types';
import Styled from './styles';

const HIGHLIGHT = '<highlight>';

const LivePollScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [showUsersAnswers, setShowUsersAnswers] = useState(false);

  const { data } = useCurrentPoll();
  const activePoll = data?.poll?.[0];

  const [pollPublishResult] = useMutation(queries.POLL_PUBLISH_RESULT);
  const [pollCancel] = useMutation(queries.POLL_CANCEL);

  const publishResultsLabel = t('mobileSdk.poll.livePoll.publishResults');

  const renderHighlighted = (sentence, highlight) => {
    const [before, after = ''] = sentence.split(HIGHLIGHT);
    return (
      <>
        {before}
        <Styled.SubtitleStrong>{highlight}</Styled.SubtitleStrong>
        {after}
      </>
    );
  };

  const handlePublish = () => {
    pollPublishResult({ variables: { pollId: activePoll.pollId } })
      .then(() => pollCancel())
      .catch(() => { });
  };

  const renderResults = () => (
    <Styled.ResultsContainer>
      {activePoll.responses.map((response) => {
        const percentage = response.pollResponsesCount === 0
          ? 0
          : Math.round((response.optionResponsesCount / response.pollResponsesCount) * 100);

        return (
          <Styled.ResultRow key={response.optionId}>
            <Styled.ResultLabel numberOfLines={1}>
              {answerLabel(response.optionDesc, activePoll.type, t)}
            </Styled.ResultLabel>
            <Styled.ResultBarTrack>
              <Styled.ResultBar percentage={percentage}>
                <Styled.ResultCount>{response.optionResponsesCount}</Styled.ResultCount>
              </Styled.ResultBar>
            </Styled.ResultBarTrack>
            <Styled.ResultPercentage>{`${percentage}%`}</Styled.ResultPercentage>
          </Styled.ResultRow>
        );
      })}
    </Styled.ResultsContainer>
  );

  const renderUsersAnswers = () => (
    activePoll.users?.filter((usr) => usr.responded).map((usr) => (
      <PollCardStyled.UserAnswerComponent
        key={usr.user.userId}
        userId={usr.user.userId}
        userName={usr.user.name}
        userAnswers={(usr.optionDescIds ?? [])
          .map((optionDesc) => answerLabel(optionDesc, activePoll.type, t))
          .join(', ')}
      />
    ))
  );

  if (!activePoll) return null;

  return (
    <ScreenWrapper renderWithView>
      <Styled.ContainerView>
        <Styled.Sheet>
          <Styled.SheetPadding>
            <Styled.HeaderContainer>
              <MaterialCommunityIcons name="poll" size={24} color={Colors.lightGray400} />
              <Styled.Title>{t('mobileSdk.poll.label')}</Styled.Title>
              <Styled.StopPollButton
                accessibilityLabel={t('mobileSdk.poll.livePoll.cancelPoll')}
                onPress={() => pollCancel()}
              />
              <Styled.CloseButton
                accessibilityLabel={t('mobileSdk.poll.backToList')}
                onPress={() => navigation.navigate('PreviousPollsScreen')}
              />
            </Styled.HeaderContainer>
            <Styled.Subtitle>
              {renderHighlighted(
                t('mobileSdk.poll.livePoll.inProgress', { type: HIGHLIGHT }),
                typeLabel(activePoll.type, t),
              )}
            </Styled.Subtitle>
            <Styled.CustomDivider />
            <Styled.QuestionText>
              {activePoll.questionText || t('mobileSdk.poll.noQuestionTextProvided')}
            </Styled.QuestionText>
            {renderResults()}
            <PollCardStyled.PressableMinimizeAnswersText
              secretPoll={activePoll.secret}
              anonLabel={t('mobileSdk.poll.createPoll.anonymous')}
              onPress={() => setShowUsersAnswers((previousValue) => !previousValue)}
            >
              {showUsersAnswers
                ? t('mobileSdk.poll.createPoll.minimize')
                : t('mobileSdk.poll.createPoll.maximize')}
            </PollCardStyled.PressableMinimizeAnswersText>
            {showUsersAnswers && renderUsersAnswers()}
            <Styled.HintText>
              {renderHighlighted(
                t('mobileSdk.poll.livePoll.publishHint', { action: HIGHLIGHT }),
                publishResultsLabel,
              )}
            </Styled.HintText>
            <Styled.PublishButton onPress={handlePublish}>
              {publishResultsLabel}
            </Styled.PublishButton>
          </Styled.SheetPadding>
        </Styled.Sheet>
      </Styled.ContainerView>
    </ScreenWrapper>
  );
};

export default LivePollScreen;
