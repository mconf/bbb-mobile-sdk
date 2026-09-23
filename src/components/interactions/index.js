import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSubscription, useMutation } from '@apollo/client';
import { hideNotification, setProfile } from '../../store/redux/slices/wide-app/notification-bar';
import useCurrentUser from '../../graphql/hooks/useCurrentUser'
import Queries from './queries';
import Styled from './styles';

const InteractionsControls = () => {
  const { data: currentUserData } = useCurrentUser();
  const { data } = useSubscription(Queries.USER_CURRENT_RAISE_HAND_SUBSCRIPTION);
  const isHandRaised = data?.user_current[0].raiseHand;
  const currentUserId = currentUserData?.user_current[0].userId;
  const [setRaiseHand] = useMutation(Queries.SET_RAISE_HAND);
  const barProfile = useSelector((state) => state.notificationBar.profile);
  const dispatch = useDispatch();

  const setRaideHands = (raiseHand) => {
    setRaiseHand({
      variables: {
        userId: currentUserId,
        raiseHand: !raiseHand,
      },
    });
  };

  // Another notice may have taken the bar, so the banner is raised again once it is free.
  useEffect(() => {
    if (isHandRaised === undefined) return;

    if (isHandRaised) {
      if (!barProfile) dispatch(setProfile({ profile: 'handsUp' }));

      return;
    }

    // The hand may have been lowered while this was unmounted, so the banner is
    // cleared whenever it is down.
    dispatch(hideNotification('handsUp'));
  }, [isHandRaised, barProfile, dispatch]);

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
