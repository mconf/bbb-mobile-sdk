import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useAudioJoin, invalidateInFlightAudioJoin } from '../../../hooks/use-audio-join';
import AudioManager from '../../../services/webrtc/audio-manager';
import {
  setAudioIntent,
  setPendingMuteAssert,
} from '../../../store/redux/slices/wide-app/audio';
import Styled from './styles';
import Settings from '../../../../settings.json';

const AudioButton = () => {
  const { t } = useTranslation();
  const { joinAudio } = useAudioJoin();
  const dispatch = useDispatch();
  const isConnected = useSelector((state) => state.audio.isConnected);
  const isConnecting = useSelector(({ audio }) => audio.isConnecting || audio.isReconnecting);
  const isActive = isConnected || isConnecting;

  const onPressHeadphone = useCallback(() => {
    if (isActive) {
      // A voluntary leave clears the mute intent for this meeting: the next join
      // honors muteOnStart instead of restoring the pre-leave mute state.
      // Even if leave audio is not available due to LK right now, it should be
      // once deafening is implemented - so this makes things future proof for now.
      dispatch(setAudioIntent(null));
      dispatch(setPendingMuteAssert(null));
      invalidateInFlightAudioJoin();
      AudioManager.exitAudio();
    } else {
      joinAudio();
    }
  }, [isActive, joinAudio]);

  if (!Settings.showNotImplementedFeatures) return null;

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
