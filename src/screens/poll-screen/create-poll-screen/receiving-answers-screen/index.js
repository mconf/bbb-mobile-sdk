import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { selectCurrentUser } from '../../../../store/redux/slices/current-user';
import { selectCurrentPoll } from '../../../../store/redux/slices/current-poll';
import PollService from '../../service';
import { useOrientation } from '../../../../hooks/use-orientation';
import ScreenWrapper from '../../../../components/screen-wrapper';
import Styled from './styles';

const ReceivingAnswers = () => {
  const currentPollObj = useSelector(selectCurrentPoll);
  const currentUserObj = useSelector(selectCurrentUser);
  const orientation = useOrientation();
  const { t } = useTranslation();

  const handleRemovePoll = async () => {
    await PollService.handleStopPoll();
  };

  useEffect(() => {
    // If the presenter was "demoted" to non-presenter
    if (!currentUserObj.presenter) {
      handleRemovePoll();
    }
  }, [currentUserObj]);

  const handleViewerAnswers = () => {
    const noPollLocale = currentPollObj.questionType === 'CUSTOM' || 'R-';

    return (
      <>
        {currentPollObj?.isMultipleResponse && <Text>{t('mobileSdk.poll.multipleChoice')}</Text>}
        {currentPollObj?.secretPoll && <Text>{t('app.poll.secretPoll.label')}</Text>}
        {currentPollObj?.answers.map((answer) => {
          const calcBarSize = (((answer.numVotes || 0) / (currentPollObj?.numResponders || 1))
            * 100).toFixed(0);
          return (
            <Styled.AnswerContainer key={answer.id}>
              <Styled.Answer>{noPollLocale ? answer.key : t(`app.poll.answer.${answer.key}`.toLowerCase())}</Styled.Answer>
              <Styled.BarContainer style={{ justifyContent: 'center' }}>
                <Styled.Bar style={{ width: `${calcBarSize}%` }} />
                <Styled.InsideBarText style={{ left: `${calcBarSize / 2}%` }}>{answer.numVotes}</Styled.InsideBarText>
              </Styled.BarContainer>
              <Styled.Percentage>{`${calcBarSize}%`}</Styled.Percentage>
            </Styled.AnswerContainer>
          );
        })}
      </>
    );
  };

  return (
    <ScreenWrapper>
      <Styled.ContainerView orientation={orientation}>
        <Styled.ContainerPollCard>
          <Styled.ContainerViewPadding>
            <Styled.Title>{t('mobileSdk.poll.inProgress')}</Styled.Title>
            <View style={{ width: '100%', backgroundColor: '#D4DDE4', height: 2 }} />
            <Styled.AnswerTitle>{currentPollObj?.question}</Styled.AnswerTitle>
            {handleViewerAnswers()}
            <Styled.ConfirmButton onPress={async () => {
              await PollService.handlePublishPoll();
              await PollService.handleStopPoll();
            }}
            >
              {t('app.poll.publishLabel')}
            </Styled.ConfirmButton>
            <Styled.CancelButton onPress={async () => {
              await PollService.handleStopPoll();
            }}
            >
              {t('app.settings.main.cancel.label')}
            </Styled.CancelButton>
          </Styled.ContainerViewPadding>
        </Styled.ContainerPollCard>
      </Styled.ContainerView>
    </ScreenWrapper>
  );
};

export default ReceivingAnswers;
