import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Text, View
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Styled from './styles';
import PollService from '../../service';
import { useOrientation } from '../../../../hooks/use-orientation';
import withPortal from '../../../../components/high-order/with-portal';

const ReceivingAnswers = () => {
  const currentPollStore = useSelector((state) => state.currentPollCollection);
  const currentPollObj = Object?.values(
    currentPollStore?.currentPollCollection
  )[0];
  const navigation = useNavigation();
  const orientation = useOrientation();
  const currentUserStore = useSelector((state) => state.currentUserCollection);
  const currentUserObj = Object.values(currentUserStore.currentUserCollection)[0];

  useEffect(() => {
    async function handleRemovePoll() {
      await PollService.handleStopPoll();
      await navigation.navigate('PollInitialScreen');
    }
    if (!currentUserObj.presenter) {
      handleRemovePoll().then(() => {});
    }
  }, [currentUserObj]);

  const handleViewerAnswers = () => {
    return (
      <>
        {currentPollObj?.isMultipleResponse && <Text>Multipla resposta</Text>}
        {currentPollObj?.secretPoll && <Text>Enquete anônima</Text>}
        {currentPollObj?.answers.map((answer) => {
          const calcBarSize = (((answer.numVotes || 0) / (currentPollObj?.numResponders || 1))
            * 100).toFixed(0);
          return (
            <Styled.AnswerContainer key={answer.id}>
              <Styled.Answer>{answer.key}</Styled.Answer>
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
          <Styled.Title>Enquete em andamento</Styled.Title>
          <View style={{ width: '100%', backgroundColor: '#D4DDE4', height: 2 }} />
          <Styled.AnswerTitle>{currentPollObj?.question}</Styled.AnswerTitle>
          {handleViewerAnswers()}
          <Styled.ConfirmButton onPress={async () => {
            await PollService.handlePublishPoll();
            await PollService.handleStopPoll();
            await navigation.navigate('PollInitialScreen');
          }}
          >
            Publicar
          </Styled.ConfirmButton>
          <Styled.CancelButton onPress={async () => {
            await PollService.handleStopPoll();
            await navigation.navigate('PollInitialScreen');
          }}
          >
            Cancelar
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
