import * as Linking from 'expo-linking';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from 'react-native';
import { useMutation, useSubscription } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { useAudioJoin } from '../../../hooks/use-audio-join';
import AudioManager from '../../../services/webrtc/audio-manager';
import { selectLockSettingsProp } from '../../../store/redux/slices/meeting';
import { isLocked } from '../../../store/redux/slices/current-user';
import { setAudioError } from '../../../store/redux/slices/wide-app/audio';
import logger from '../../../services/logger';
import Queries from './queries';
import Styled from './styles';

const AudioControls = () => {
  const [audioPermissionTainted, setAudioPermissionTainted] = useState(false);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { joinAudio } = useAudioJoin();
  const isConnected = useSelector((state) => state.audio.isConnected);
  const isConnecting = useSelector(({ audio }) => audio.isConnecting || audio.isReconnecting);
  const micDisabled = useSelector((state) => selectLockSettingsProp(state, 'disableMic') && isLocked(state));
  const isListenOnly = useSelector((state) => state.audio.isListenOnly);
  const audioError = useSelector((state) => state.audio.audioError);
  const localMutedState = useSelector((state) => state.audio.isMuted);
  const isActive = isConnected || isConnecting;
  const {
    data: currentUserVoiceData,
    loading: currentUserVoiceLoading,
  } = useSubscription(Queries.USER_CURRENT_VOICE);
  const isMuted = currentUserVoiceData?.user_current[0]?.voice?.muted;
  const unmutedAndConnected = !isMuted && isConnected;

  const [userSetMuted] = useMutation(Queries.USER_SET_MUTED);

  useEffect(() => {
    if (!currentUserVoiceLoading && (localMutedState !== isMuted)) {
      AudioManager.setMutedState(isMuted);
    }
  }, [isMuted, currentUserVoiceLoading, localMutedState]);

  useEffect(() => {
    if (audioError) {
      switch (audioError) {
        case 'NotAllowedError':
        case 'SecurityError': {
          // TODO localization, programmatically dismissable Dialog that is reusable
          const buttons = [
            {
              text: t('app.settings.main.cancel.label'),
              style: 'cancel',
              onPress: () => {
                setAudioPermissionTainted(true);
              },
            },
            {
              text: t('app.settings.main.label'),
              onPress: () => {
                Linking.openSettings();
                setAudioPermissionTainted(true);
              },
            },
            {
              text: t('mobileSdk.error.tryAgain'),
              onPress: () => joinAudio(),
            },
          ];

          Alert.alert(
            t('mobileSdk.error.microphone.permissionDenied'),
            t('mobileSdk.error.microphone.permissionLabel'),
            buttons,
            { cancelable: true },
          );
          break;
        }
        case 'ListenOnly':
          if (AudioManager.isListenOnly) {
            // TODO localization, programmatically dismissable Dialog that is reusable
            Alert.alert(
              t('mobileSdk.error.microphone.blocked'),
              t('app.audioNotificaion.reconnectingAsListenOnly'),
              null,
              { cancelable: true },
            );
          }
          break;
        default:
          // FIXME surface the rest of the errors via toast or chain a retry.
      }

      // Error is handled, clean it up
      dispatch(setAudioError(null));
    }
  }, [audioError]);

  const toggleVoice = useCallback(async (mutedVal) => {
    const userId = currentUserVoiceData?.user_current[0]?.voice?.userId;
    const currMuted = currentUserVoiceData?.user_current[0]?.voice?.muted;
    const muted = typeof mutedVal === 'boolean' ? mutedVal : !currMuted;

    try {
      await userSetMuted({ variables: { muted, userId } });
    } catch (e) {
      logger.error('Error on trying to toggle muted');
    }
  }, [currentUserVoiceData]);

  const onPressMic = useCallback(() => {
    // Lock settings are applied to the user
    if (micDisabled) {
      // TODO localization, programmatically dismissable Dialog that is reusable
      Alert.alert(
        t('mobileSdk.error.microphone.blocked'),
        t('mobileSdk.permission.moderator'),
        null,
        { cancelable: true },
      );
    } else if (audioPermissionTainted) {
      // Audio permission was tainted (i.e. user denied permission and didn't grant it)
      // Try to join audio again
      setAudioPermissionTainted(false);
      joinAudio().then(() => {
        toggleVoice(false);
      });
    } else {
      toggleVoice();
    }
  }, [micDisabled, audioPermissionTainted, toggleVoice]);

  const onPressHeadphone = () => {
    if (isActive) {
      AudioManager.exitAudio();
    } else {
      joinAudio();
    }
  };

  return (
    <Styled.AudioButtonComponent
      isConnected={isConnected}
      isConnecting={isConnecting}
      isListenOnly={isListenOnly}
      unmutedAndConnected={unmutedAndConnected}
      isActive={isActive}
      onPressJoined={onPressMic}
      onPressNotJoined={onPressHeadphone}
    />
  );
};

export default AudioControls;
