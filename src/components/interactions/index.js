import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSubscription, useMutation } from '@apollo/client';
import { hideNotification, setProfile } from '../../store/redux/slices/wide-app/notification-bar';
import useCurrentUser from '../../graphql/hooks/useCurrentUser'
import usePrevious from '../../hooks/use-previous';
import Queries from './queries';
import Styled from './styles';

const InteractionsControls = () => {
  const { data: currentUserData } = useCurrentUser();
  const { data } = useSubscription(Queries.USER_CURRENT_RAISE_HAND_SUBSCRIPTION);
  const isHandRaised = data?.user_current[0].raiseHand;
  const previousHandRaised = usePrevious(isHandRaised);
  const currentUserId = currentUserData?.user_current[0].userId;
  const [setRaiseHand] = useMutation(Queries.SET_RAISE_HAND);
  const dispatch = useDispatch();

  const setRaideHands = (raiseHand) => {
    setRaiseHand({
      variables: {
        userId: currentUserId,
        raiseHand: !raiseHand,
      },
    });
  };

  useEffect(() => {
    if (isHandRaised === undefined || previousHandRaised === undefined) return;
    if (isHandRaised === previousHandRaised) return;
    if (isHandRaised) {
      dispatch(setProfile({ profile: 'handsUp' }));
    } else {
      dispatch(hideNotification());
    }
  }, [isHandRaised, previousHandRaised, dispatch]);

  const onPressButton = () => {
    setRaideHands(isHandRaised);
  };

  return (
    <Styled.RaiseHandButton
      isHandRaised={isHandRaised}
      onPress={onPressButton}
    />
  );
};

export default InteractionsControls;
