import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hideNotification, setProfile } from '../../store/redux/slices/wide-app/notification-bar';
import InteractionsService from './service';
import IconButtonComponent from '../icon-button';
import Colors from '../../constants/colors';

const InteractionsControls = (props) => {
  const { isLandscape } = props;
  const currentUserStore = useSelector((state) => state.currentUserCollection);
  const currentUserObj = Object.values(
    currentUserStore.currentUserCollection
  )[0];
  const isHandRaised = currentUserObj?.emoji === 'raiseHand';
  const dispatch = useDispatch();

  return (
    <IconButtonComponent
      size={isLandscape ? 24 : 32}
      icon={isHandRaised
        ? 'hand-back-left-outline'
        : 'hand-back-left-off-outline'}
      iconColor={
        isHandRaised ? Colors.white : Colors.lightGray300
      }
      containerColor={
        isHandRaised ? Colors.blue : Colors.lightGray100
      }
      animated
      onPress={async () => {
        await InteractionsService.handleSendRaiseHand(
          isHandRaised
            ? 'none'
            : 'raiseHand'
        );
        if (!isHandRaised) {
          dispatch(setProfile('handsUp'));
        } else {
          dispatch(hideNotification());
        }
      }}
    />
  );
};

export default InteractionsControls;
