/* eslint-disable camelcase */
import { useState } from 'react';
import { View } from 'react-native';
import { useMutation } from '@apollo/client';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { trigDetailedInfo } from '../../../../store/redux/slices/wide-app/layout';
import ActivityBar from '../../../../components/activity-bar';
import PollService from '../../service';
import Styled from './styles';
import queries from '../../queries';
import PrimaryButton from '../../../../components/buttons/primary-button';

const PreviousPollCard = (props) => {
  const { pollObj, amIPresenter } = props;
  const {
    publishedAt,
    pollId,
    type,
    questionText,
    responses,
    multipleResponses,
    secret,
    ended,
    published,
    users_aggregate,
    responses_aggregate,
    users
  } = pollObj;

  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [pollCancel] = useMutation(queries.POLL_CANCEL);
  const [pollPublishResult] = useMutation(queries.POLL_PUBLISH_RESULT);

  const noPollLocale = type === 'CUSTOM' || type === 'R-';
  const timestamp = new Date(publishedAt);
  const isReceivingAnswers = !ended && !published && amIPresenter;
  const [showUsersAnswers, setShowUsersAnswers] = useState(false);

  // ? It means the poll has been canceled
  if (ended && !published) {
    return;
  }

  const handlePollPublish = async () => {
    pollPublishResult({
      variables: {
        pollId
      },
    });
  };

  const renderUsersAnswers = () => (
    users?.map((usr) => (
      <Styled.UserAnswerComponent
        key={usr.user.userId}
        userId={usr.user.userId}
        userName={usr.user.name}
        userAnswers={usr.optionDescIds}
      />
    ))
  );

  const renderAnswers = () => (
    responses.map((response) => (
      <View key={response.optionId}>
        <Styled.AnswerContainer>
          <Styled.LabelContainer>
            <Styled.PercentageText numberOfLines={1}>
              {(response.optionResponsesCount === 0
                ? 0
                : (response.optionResponsesCount / response.pollResponsesCount) * 100).toFixed(0)}
              %
            </Styled.PercentageText>
            <Styled.KeyText>
              {noPollLocale ? response.optionDesc : t(`app.poll.answer.${response.optionDesc}`.toLowerCase())}
            </Styled.KeyText>
          </Styled.LabelContainer>
          <ActivityBar
            width={`${response.optionResponsesCount === 0
              ? 0
              : (((response.optionResponsesCount / response.pollResponsesCount) * 100).toFixed(0))}%`}
          />
        </Styled.AnswerContainer>
      </View>
    ))
  );

  const renderBottomSideOfCard = () => {
    if (!isReceivingAnswers) {
      return (
        <Styled.PollInfoLabelContainer>
          <Styled.PollInfoText>
            {`${String(timestamp.getHours()).padStart(2, '0')}:${String(
              timestamp.getMinutes()
            ).padStart(2, '0')}`}
          </Styled.PollInfoText>
        </Styled.PollInfoLabelContainer>
      );
    }

    return (
      <>
        <Styled.PollInfoLabelContainer>
          <Styled.PresenterContainerOptions>
            <Styled.PressableMinimizeAnswersText
              secretPoll={secret}
              showUsersAnswers={showUsersAnswers}
              anonLabel={t('mobileSdk.poll.createPoll.anonymous')}
              onPress={() => setShowUsersAnswers((prevValue) => !prevValue)}
            >
              {showUsersAnswers ? t('mobileSdk.poll.createPoll.minimize') : t('mobileSdk.poll.createPoll.maximize')}
            </Styled.PressableMinimizeAnswersText>
            <Styled.DeleteIcon onPress={() => PollService.handleStopPoll()} />
          </Styled.PresenterContainerOptions>
        </Styled.PollInfoLabelContainer>
        {showUsersAnswers && renderUsersAnswers()}
      </>
    );
  };

  return (
    <View>
      <Styled.ContainerPollCard onPress={() => dispatch(trigDetailedInfo())}>
        <Styled.QuestionText>
          {questionText === '' || !questionText
            ? t('mobileSdk.poll.noQuestionTextProvided')
            : questionText}
        </Styled.QuestionText>
        {renderAnswers()}
        <Styled.CustomDivider />
        {renderBottomSideOfCard()}
        <Styled.BlankSpaceForButton />
      </Styled.ContainerPollCard>
      <Styled.ButtonContainer buttonColor={!isReceivingAnswers}>
        <PrimaryButton
          disabled={!isReceivingAnswers}
          fullWidth={false}
          onPress={() => {
            handlePollPublish();
            pollCancel();
          }}
        >
          {isReceivingAnswers ? t('mobileSdk.poll.createPoll.publish') : t('mobileSdk.poll.previousPolls.publishedLabel')}
        </PrimaryButton>
      </Styled.ButtonContainer>
    </View>
  );
};

export default PreviousPollCard;
