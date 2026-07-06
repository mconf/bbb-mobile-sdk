import React from 'react';
import { useDispatch } from 'react-redux';
import BbbBreakoutSdk from 'bbb-breakout-sdk';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { setMainRoomBlockedByBreakout } from '../../store/redux/slices/wide-app/client';

const InsideBreakoutRoomScreen = (props) => {
  const dispatch = useDispatch();
  const { route } = props;
  const { i18n } = useTranslation();
  const navigation = useNavigation();

  return (
    <></>
  );
};

export default InsideBreakoutRoomScreen;
