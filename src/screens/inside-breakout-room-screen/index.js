import React from 'react';
import BbbBreakoutSdk from 'bbb-breakout-sdk';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { joinAudio } from '../../store/redux/slices/voice-users';
import { setAudioError } from '../../store/redux/slices/wide-app/audio';
import AudioManager from '../../services/webrtc/audio-manager';

const InsideBreakoutRoomScreen = (props) => {
  const { route } = props;
  const { i18n } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const joinMicrophone = () => {
    dispatch(joinAudio()).unwrap().then(() => {
      // If user joined as listen only, it means they are locked which is a soft
      // error that needs to be surfaced
      if (AudioManager.isListenOnly) dispatch(setAudioError('ListenOnly'));
    }).catch((error) => {
      dispatch(setAudioError(error.name));
    });
  };

  return (
    <BbbBreakoutSdk
      jUrl={route.params.joinUrl}
      onLeaveSession={() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
        joinMicrophone();
      }}
      defaultLanguage={i18n.language}
    />
  );
};

export default InsideBreakoutRoomScreen;
