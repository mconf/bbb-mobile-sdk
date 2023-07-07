import React from 'react';
import BbbSdk from 'bbb-mobile-sdk';
import { useNavigation } from '@react-navigation/native';

const InsideBreakoutRoomScreen = (props) => {
  const { route } = props;
  const navigation = useNavigation();

  return (
    <BbbSdk
      jUrl={route.params.joinUrl}
      onLeaveSession={() => navigation.goBack()}
    />
  );
};

export default InsideBreakoutRoomScreen;
