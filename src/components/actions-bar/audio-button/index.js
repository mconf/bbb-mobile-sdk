import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useAudioJoin } from '../../../hooks/use-audio-join';
import AudioManager from '../../../services/webrtc/audio-manager';
import Styled from './styles';
import Settings from '../../../../settings.json';

const AudioButton = () => {
  const { t } = useTranslation();
  const { joinAudio } = useAudioJoin();
  const isConnected = useSelector((state) => state.audio.isConnected);
  const isConnecting = useSelector(({ audio }) => audio.isConnecting || audio.isReconnecting);
  const isActive = isConnected || isConnecting;

  if (!Settings.showNotImplementedFeatures) {
    return null;
  };

  const onPressHeadphone = () => {
    if (isActive) {
      AudioManager.exitAudio();
    } else {
      joinAudio();
    }
  };

  return (
    <Styled.ContainerPressable
      rippleColor="rgba(0, 0, 0, .32)"
      onPress={onPressHeadphone}
    >
      <>
        <Styled.HeadphoneIconContainer isActive={isActive} />
        <Styled.HeadphoneText isActive={isActive}>
          {!isActive ? t('mobileSdk.audio.join') : t('app.audio.leaveAudio')}
        </Styled.HeadphoneText>
      </>
    </Styled.ContainerPressable>
  );
};

export default AudioButton;
