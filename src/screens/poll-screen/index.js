import { KeyboardAvoidingView, Platform } from 'react-native';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useOrientation } from '../../hooks/use-orientation';
import withPortal from '../../components/high-order/with-portal';
import PreviousPollCard from './previous-polls';
import CreatePollView from './create-poll';
import AnswerPollView from './answer-poll';
import Styled from './styles';

const PollScreen = () => {
  // Screen global variables
  const currentUserStore = useSelector((state) => state.currentUserCollection);
  const pollsStore = useSelector((state) => state.pollsCollection);
  const previousPollPublishedStore = useSelector(
    (state) => state.previousPollPublishedCollection
  );

  // ** Poll views states **
  // 0 - No poll
  // 1 - Poll received
  const [pollViewCurrentState, setPollViewCurrentState] = useState(0);
  const [isPresenter, setIsPresenter] = useState(
    Object.values(currentUserStore?.currentUserCollection)[0]?.presenter
  );
  const activePollObject = Object.values(pollsStore.pollsCollection)[0];
  const orientation = useOrientation();

  // lifecycle methods
  useEffect(() => {
    setIsPresenter(
      Object.values(currentUserStore?.currentUserCollection)[0]?.presenter
    );
  }, [currentUserStore]);

  useEffect(() => {
    setPollViewCurrentState(activePollObject ? 1 : 0);
  }, [activePollObject]);

  const noPollView = () => {
    if (
      Object.keys(previousPollPublishedStore.previousPollPublishedCollection)
        .length === 0
    ) {
      return (
        <>
          <Styled.Title> Nenhuma enquete foi publicada</Styled.Title>
          <Styled.NoPollText>
            Quando o apresentador publicar uma enquete, ela aparecerá aqui
          </Styled.NoPollText>
        </>
      );
    }

    return Object.values(
      previousPollPublishedStore.previousPollPublishedCollection
    ).map((pollObj) => <PreviousPollCard pollObj={pollObj} key={pollObj.id} />);
  };

  const handlePollViewCurrentState = () => {
    // Campus party event
    if (true) {
      return <CreatePollView />;
    }

    switch (pollViewCurrentState) {
      case 0:
        return noPollView();
      case 1:
        return <AnswerPollView />;
      default:
        return noPollView();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Styled.ContainerView orientation={orientation}>
        <Styled.ContainerPollCard>
          <Styled.ContainerViewPadding>
            {handlePollViewCurrentState()}
          </Styled.ContainerViewPadding>
        </Styled.ContainerPollCard>

        <Styled.ActionsBarContainer orientation={orientation}>
          <Styled.ActionsBar orientation={orientation} />
        </Styled.ActionsBarContainer>
      </Styled.ContainerView>
    </KeyboardAvoidingView>
  );
};

export default withPortal(PollScreen);
