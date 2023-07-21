import React from 'react';
import BbbBreakoutSdk from 'bbb-breakout-sdk';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const InsideBreakoutRoomScreen = (props) => {
  const { route } = props;
  const { i18n } = useTranslation();
  const navigation = useNavigation();

  return (
    <BbbBreakoutSdk
      jUrl={route.params.joinUrl}
      onLeaveSession={() => navigation.goBack()}
      defaultLanguage={i18n.language}
    />
  );
};

export default InsideBreakoutRoomScreen;
