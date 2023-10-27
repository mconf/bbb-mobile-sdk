import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { trigDetailedInfo } from '../../../../store/redux/slices/wide-app/layout';
import { selectUsersName } from '../../../../store/redux/slices/users';
import ActivityBar from '../../../../components/activity-bar';
import PollService from '../../service';
import Styled from './styles';

const PreviousPollCard = (props) => {
  const { pollObj } = props;

  const { t } = useTranslation();
  const dispatch = useDispatch();

  const noPollLocale = pollObj?.questionType === 'CUSTOM' || pollObj?.questionType === 'R-';
  const timestamp = new Date(parseInt(pollObj.id.split('/')[2], 10));
  const isReceivingAnswers = pollObj?.receivingAnswers;
  const answersType = pollObj?.answers;
  const usersName = useSelector(selectUsersName);

  const [mappedObject, setMappedObject] = useState({});
  const [showUsersAnswers, setShowUsersAnswers] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const mapObj = {};

      answersType?.forEach((item) => {
        const { id, ...rest } = item;
        mapObj[id] = rest;
      });

      setMappedObject(mapObj);
    }, [answersType?.length])
  );

  const returnStringfyAnswers = (arr) => {
    const ansArray = [];
    arr.forEach((item) => {
      if (mappedObject ?? item) {
        ansArray.push(mappedObject[item]?.key);
      }
    });
    return ansArray;
  };

  const renderUsersAnswers = () => (
    pollObj?.responses?.map((ans) => (
      <Styled.UserAnswerComponent
        key={ans.userId}
        userId={ans.userId}
        userName={usersName[ans.userId].name}
        userAnswers={returnStringfyAnswers(ans.answerIds)}
      />
    ))
  );

  const renderAnswers = () => (
    pollObj.answers.map((answer) => (
      <View key={answer.id}>
        <Styled.AnswerContainer>
          <Styled.LabelContainer>
            <Styled.PercentageText numberOfLines={1}>
              {(pollObj?.numResponders === 0 || !pollObj?.numResponders
                ? 0
                : (answer.numVotes / pollObj.numResponders) * 100).toFixed(0)}
              %
            </Styled.PercentageText>
            <Styled.KeyText>
              {noPollLocale ? answer.key : t(`app.poll.answer.${answer.key}`.toLowerCase())}
            </Styled.KeyText>
          </Styled.LabelContainer>
          <ActivityBar
            width={`${pollObj.numResponders === 0 || !pollObj?.numResponders
              ? 0
              : (((answer.numVotes / pollObj.numResponders) * 100).toFixed(0))}%`}
          />
        </Styled.AnswerContainer>
      </View>
    ))
  );

  const renderBottomSideOfCard = () => {
    if (!isReceivingAnswers) {
      return (
        <Styled.PollInfoLabelContainer>
          <Styled.PollInfoText>{`${pollObj.numResponders} / ${pollObj.numRespondents}`}</Styled.PollInfoText>
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
          <Styled.PollInfoText>
            {
          `${pollObj.numResponders ?? 0} / ${pollObj.numRespondents ?? 0}`
          }
          </Styled.PollInfoText>
          <Styled.PresenterContainerOptions>
            <Styled.PressableMinimizeAnswersText
              secretPoll={pollObj.secretPoll}
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
          {pollObj?.questionText === '' || !pollObj.questionText
            ? t('mobileSdk.poll.noQuestionTextProvided')
            : pollObj.questionText}
        </Styled.QuestionText>
        {renderAnswers()}
        <Styled.CustomDivider />
        {renderBottomSideOfCard()}
        <Styled.BlankSpaceForButton />
      </Styled.ContainerPollCard>
      <Styled.PressableButton
        disabled={!isReceivingAnswers}
        onPress={() => {
          PollService.handlePublishPoll();
          PollService.handleStopPoll();
        }}
      >
        {isReceivingAnswers ? t('mobileSdk.poll.createPoll.publish') : t('mobileSdk.poll.previousPolls.publishedLabel')}
      </Styled.PressableButton>
    </View>
  );
};

export default PreviousPollCard;
