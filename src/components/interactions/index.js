import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setIsHandRaised } from '../../store/redux/slices/wide-app/interactions';
import IconButtonComponent from '../icon-button';
import Colors from '../../constants/colors';

const InteractionsControls = (props) => {
  const { isLandscape } = props;
  const interactionsStore = useSelector((state) => state.interactions);
  const dispatch = useDispatch();

  return (
    <IconButtonComponent
      size={isLandscape ? 24 : 32}
      icon={interactionsStore.isHandRaised
        ? 'hand-back-left-outline'
        : 'hand-back-left-off-outline'}
      iconColor={
        interactionsStore.isHandRaised ? Colors.white : Colors.lightGray300
      }
      containerColor={
        interactionsStore.isHandRaised ? Colors.blue : Colors.lightGray100
      }
      animated
      onPress={() => dispatch(setIsHandRaised(!interactionsStore.isHandRaised))}
    />
  );
};

export default InteractionsControls;
