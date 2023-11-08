import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { setProfile } from '../../../store/redux/slices/wide-app/modal';
import { trigDetailedInfo } from '../../../store/redux/slices/wide-app/layout';
import Styled from './styles';

const DeviceSelectorControl = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  return (
    <Styled.Container
      onPress={() => {
        dispatch(trigDetailedInfo());
        dispatch(setProfile({
          profile: 'audio_device_selector',
        }));
      }}
    >
      <Styled.AudioIcon name="headphones" size={24} color="white" />
      <Styled.AudioText>
        {t('mobileSdk.audio.deviceSelector.title')}
      </Styled.AudioText>
      <Styled.OpenAudioSelectorIcon />
    </Styled.Container>
  );
};

export default DeviceSelectorControl;
