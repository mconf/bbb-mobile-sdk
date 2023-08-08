import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { selectCurrentUser } from '../../../../store/redux/slices/current-user';
import { selectCurrentPoll } from '../../../../store/redux/slices/current-poll';
import Styled from './styles';
import PollService from '../../service';
import { useOrientation } from '../../../../hooks/use-orientation';
import withPortal from '../../../../components/high-order/with-portal';

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
    const isCustomPoll = currentPollObj?.questionType === 'CUSTOM';

    return (
      <>
        {currentPollObj?.isMultipleResponse && <Text>{t('mobileSdk.poll.multipleChoice')}</Text>}
        {currentPollObj?.secretPoll && <Text>{t('app.poll.secretPoll.label')}</Text>}
        {currentPollObj?.answers.map((answer) => {
          const calcBarSize = (((answer.numVotes || 0) / (currentPollObj?.numResponders || 1))
            * 100).toFixed(0);
          return (
            <Styled.AnswerContainer key={answer.id}>
              <Styled.Answer>{isCustomPoll ? answer.key : t(`app.poll.answer.${answer.key}`.toLowerCase())}</Styled.Answer>
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

      <Styled.ActionsBarContainer orientation={orientation}>
        <Styled.ActionsBar orientation={orientation} />
      </Styled.ActionsBarContainer>
    </Styled.ContainerView>
  );
};

export default withPortal(ReceivingAnswers);
