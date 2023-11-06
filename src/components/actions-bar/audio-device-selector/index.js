import React from 'react';
import InCallManager from 'react-native-incall-manager';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import Styled from './styles';

const AudioDeviceSelector = () => {
  const { t } = useTranslation();

  const audioDevices = useSelector((state) => state.audio.audioDevices);
  const selectedAudioDevice = useSelector((state) => state.audio.selectedAudioDevice);

  return (
    <Styled.ButtonContainer>
      <Styled.DeviceSelectorTitle>{t('mobileSdk.audio.deviceSelector.title')}</Styled.DeviceSelectorTitle>
      <Styled.OptionsButton onPress={() => InCallManager.chooseAudioRoute('EARPIECE')} selected={selectedAudioDevice === 'EARPIECE'}>
        {t('mobileSdk.audio.deviceSelector.earpiece')}
      </Styled.OptionsButton>
      <Styled.OptionsButton onPress={() => InCallManager.chooseAudioRoute('SPEAKER_PHONE')} selected={selectedAudioDevice === 'SPEAKER_PHONE'}>
        {t('mobileSdk.audio.deviceSelector.speakerPhone')}
      </Styled.OptionsButton>
      {audioDevices.includes('BLUETOOTH') && (
      <Styled.OptionsButton onPress={() => InCallManager.chooseAudioRoute('BLUETOOTH')} selected={selectedAudioDevice === 'BLUETOOTH'}>
        {t('mobileSdk.audio.deviceSelector.bluetooth')}
      </Styled.OptionsButton>
      )}
      {audioDevices.includes('WIRED_HEADSET') && (
      <Styled.OptionsButton onPress={() => InCallManager.chooseAudioRoute('WIRED_HEADSET')} selected={selectedAudioDevice === 'WIRED_HEADSET'}>
        {t('mobileSdk.audio.deviceSelector.wiredHeadset')}
      </Styled.OptionsButton>
      )}
    </Styled.ButtonContainer>
  );
};

export default AudioDeviceSelector;
