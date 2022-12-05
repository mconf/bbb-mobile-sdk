import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Colors from '../../constants/colors';
import Styled from './styles';
import { fetchGuestStatus } from '../../store/redux/slices/wide-app/client';
import logger from '../../services/logger';

const GUEST_POLL_INTERVAL = 10000;

const GuestScreen = () => {
  const dispatch = useDispatch();
  const guestStatus = useSelector((state) => state.client.guestStatus);
  const guestPollInterval = useRef(null);
  const [lobbyMessage, setLobbyMessage] = useState(null);
  const [positionInWaitingQueue, setPositionInWaitingQueue] = useState(null);
  // TODO localization
  const guestScreenTitle = 'Sala de espera dos convidados';
  const guestScreenSubtitle = 'Aguarde até que um moderador aprove sua entrada';
  const firstInQueueStr = 'Você é o primeiro da fila!';
  const laterInQueueStr = 'Sua posição atual na fila de espera é:';

  const probeGuestStatus = async () => {
    try {
      const { response } = await dispatch(fetchGuestStatus()).unwrap();
      const {
        lobbyMessage: message,
        positionInWaitingQueue: position
      } = response;
      if (position) setPositionInWaitingQueue(parseInt(position, 10));
      if (typeof message === 'string' && message) setLobbyMessage(message);
    } catch (error) {
      logger.error({
        logCode: 'guest_poll_failure',
        extraInfo: {
          errorCode: error.code,
          errorMessage: error.message,
        }
      }, `Guest poll failed: ${error.message}`);
    }
  };

  const startPolling = () => {
    probeGuestStatus();
    guestPollInterval.current = setInterval(probeGuestStatus, GUEST_POLL_INTERVAL);
  };

  const stopPolling = () => {
    if (guestPollInterval.current) {
      clearInterval(guestPollInterval.current);
      guestPollInterval.current = null;
    }
  };

  useEffect(() => {
    startPolling();
    return () => {
      stopPolling();
    };
  }, []);

  useEffect(() => {
    if (guestStatus !== 'WAIT') {
      stopPolling();
    }
  }, [guestStatus]);

  const getPositionInWaitingQueueMessage = () => {
    if (positionInWaitingQueue === 1) {
      return firstInQueueStr;
    }

    if (positionInWaitingQueue > 1) {
      return `${laterInQueueStr} ${positionInWaitingQueue}`;
    }

    return null;
  };

  return (
    <Styled.ContainerView>
      <Styled.GuestCardContainer>
        <Styled.GuestScreenTitle>{guestScreenTitle}</Styled.GuestScreenTitle>
        <Styled.GuestScreenSubtitle>{guestScreenSubtitle}</Styled.GuestScreenSubtitle>
        <Styled.WaitingAnimation
          size={64}
          color={Colors.blue}
          animating
          hidesWhenStopped
        />
        {lobbyMessage && (
          <Styled.GuestScreenTextContent>{lobbyMessage}</Styled.GuestScreenTextContent>
        )}
        {positionInWaitingQueue && (
          <Styled.GuestScreenTextContent>
            {getPositionInWaitingQueueMessage()}
          </Styled.GuestScreenTextContent>
        )}
      </Styled.GuestCardContainer>
    </Styled.ContainerView>
  );
};

export default GuestScreen;
