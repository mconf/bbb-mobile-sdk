import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View } from 'react-native';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { trigDetailedInfo } from '../../../../store/redux/slices/wide-app/layout';
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
        userName={ans.userId}
        userAnswers={returnStringfyAnswers(ans.answerIds)}
      />
    ))
  );

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
          <Styled.PollInfoText>{`${pollObj.numResponders} / ${pollObj.numRespondents}`}</Styled.PollInfoText>
          <Styled.PresenterContainerOptions>
            <Styled.MinimizeAnswersText
              onPress={() => setShowUsersAnswers((prevValue) => !prevValue)}
            >
              {showUsersAnswers ? 'Minimizar Respostas' : 'Maximizar Respostas'}
            </Styled.MinimizeAnswersText>
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
          {pollObj.questionText === ''
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
        {isReceivingAnswers ? 'Publicar enquete' : t('mobileSdk.poll.previousPolls.publishedLabel')}
      </Styled.PressableButton>
    </View>
  );
};

export default PreviousPollCard;
