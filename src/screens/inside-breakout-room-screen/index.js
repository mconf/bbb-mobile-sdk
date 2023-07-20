import React from 'react';
import BbbBreakoutSdk from 'bbb-breakout-sdk';
import { useNavigation } from '@react-navigation/native';

const InsideBreakoutRoomScreen = (props) => {
  const { route } = props;
  const navigation = useNavigation();

  return (
    <BbbBreakoutSdk
      jUrl={route.params.joinUrl}
      onLeaveSession={() => navigation.goBack()}
    />
  );
};

export default InsideBreakoutRoomScreen;
