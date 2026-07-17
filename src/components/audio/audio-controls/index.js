import * as Linking from 'expo-linking';
import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { Alert } from 'react-native';
import { useMutation, useSubscription } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { useAudioJoin, invalidateInFlightAudioJoin } from '../../../hooks/use-audio-join';
import useCurrentUser from '../../../graphql/hooks/useCurrentUser';
import useMeeting from '../../../graphql/hooks/useMeeting';
import AudioManager from '../../../services/webrtc/audio-manager';
import {
  setAudioError,
  setAudioIntent,
  setPendingMuteAssert,
} from '../../../store/redux/slices/wide-app/audio';
import logger from '../../../services/logger';
import Queries from './queries';
import Styled from './styles';

// How long to wait for mute state reconciliation between a local mute assertion
// vs the server (voice.muted). If convergence is not observed, fall back to
// the server state for consistency.
const MUTE_ASSERT_CONVERGENCE_TIMEOUT_MS = 5000;

const AudioControls = () => {
  const [audioPermissionTainted, setAudioPermissionTainted] = useState(false);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { joinAudio } = useAudioJoin();
  const { data: currentUserData } = useCurrentUser();
  const { data: meetingData } = useMeeting();
  const isConnected = useSelector((state) => state.audio.isConnected);
  const isConnecting = useSelector(({ audio }) => audio.isConnecting || audio.isReconnecting);
  const isListenOnly = useSelector((state) => state.audio.isListenOnly);
  const audioError = useSelector((state) => state.audio.audioError);
  const localMutedState = useSelector((state) => state.audio.isMuted);
  const pendingMuteAssert = useSelector((state) => state.audio.pendingMuteAssert);
  const pendingMuteAssertEpoch = useSelector((state) => state.audio.pendingMuteAssertEpoch);
  const [userSetMuted] = useMutation(Queries.USER_SET_MUTED);
  const reduxStore = useStore();
  // The Redux epoch when we last fired a mute mutation. Ties to the store's
  // pendingMuteAssertEpoch.
  const muteAssertFiredEpoch = useRef(null);
  const muteAssertTimeout = useRef(null);

  const currentUserLocked = currentUserData?.user_current[0]?.locked ?? false;
  const meetingMicLocked = meetingData?.meeting[0]?.lockSettings?.disableMic;
  const micDisabled = meetingMicLocked && currentUserLocked;
  const isActive = isConnected || isConnecting;
  const {
    data: currentUserVoiceData,
    loading: currentUserVoiceLoading,
  } = useSubscription(Queries.USER_CURRENT_VOICE);
  const voice = currentUserVoiceData?.user_current[0]?.voice;
  const isMuted = voice?.muted;
  const unmutedAndConnected = !isMuted && isConnected;

  // Mute reconciliation effect: applies the server's mute state
  // locally if it differs from the local state based on specific conditions.
  useEffect(() => {
    // Server-client mute reconciliation has two skip conditions:
    // - While the voice record is absent as it can be nullish on reconnects.
    //   Trying this against an absent voice collection can lead to incorrectly
    //   unmuting the local mic track.
    // - While a mute re-assert is pending - the restored mute intent must reach the
    //   server first, or the reconciliation would flip it back to muteOnStart
    if (currentUserVoiceLoading || !voice) return;
    if (pendingMuteAssert !== null) return;

    if (localMutedState !== isMuted) AudioManager.setMutedState(isMuted);
  }, [isMuted, currentUserVoiceLoading, localMutedState, voice, pendingMuteAssert]);

  // Mute state re-assertion after a rejoin (breakouts, reconnects, etc): once
  // a rejoined session's voice record exists, push our restored mute intent to the
  // server so voice.muted converges to it instead of muteOnStart, then let the
  // reconciliation in the above affect apply the server's verdict locally.
  // tl;dr: mute(x) -> rejoin -> voice.muted(y) -> assert mute(x) -> voice.muted(x)
  //        -> AudioManager.setMutedState(x)
  // Approach here is asymmetric on mute state:
  // - muted=true: always succeeds server-side, so wait for voice.muted convergence
  //   before releasing pendingMuteAssert
  // - muted=false: may be refused (e.g.: lock settings), so release pendingMuteAssert
  // on the spot and follow the server.
  useEffect(() => {
    if (pendingMuteAssert === null) {
      if (muteAssertTimeout.current) {
        clearTimeout(muteAssertTimeout.current);
        muteAssertTimeout.current = null;
      }

      return;
    }

    if (currentUserVoiceLoading || !voice) return;

    const epoch = pendingMuteAssertEpoch;
    const fired = muteAssertFiredEpoch.current === epoch;
    const isLiveEpoch = () => reduxStore.getState().audio.pendingMuteAssertEpoch === epoch;

    // State convergence is only trusted after our own assert was sent for
    // whatever was stored latest.
    // We cannot clear eagerly as a voice record on re-join, at this point, might
    // be from  the previous cycle, which would be stale and cause assertion to be
    // cleared incorrectly.
    // tl;dr: mute(x) -> rejoin -> voice.muted(y) -> assert mute(x) -> voice.muted(x)
    //        -> clear pendingMuteAssert
    if (fired && voice.muted === pendingMuteAssert) {
      dispatch(setPendingMuteAssert(null));
      return;
    }

    if (!fired) {
      muteAssertFiredEpoch.current = epoch;

      userSetMuted({ variables: { muted: pendingMuteAssert, userId: voice.userId } })
        .then(() => {
          if (!isLiveEpoch()) return;

          if (pendingMuteAssert === false) {
            dispatch(setPendingMuteAssert(null));
          } else {
            const timer = setTimeout(() => {
              if (muteAssertTimeout.current === timer) muteAssertTimeout.current = null;

              if (isLiveEpoch()) {
                logger.warn({
                  logCode: 'audio_mute_reassert_unconverged',
                  extraInfo: { pendingMuteAssert },
                }, 'Mute re-assert did not converge; falling back to server state');
                dispatch(setPendingMuteAssert(null));
              }
            }, MUTE_ASSERT_CONVERGENCE_TIMEOUT_MS);

            muteAssertTimeout.current = timer;
          }
        })
        .catch((error) => {
          logger.error({
            logCode: 'audio_mute_reassert_failure',
            extraInfo: {
              errorMessage: error?.message,
              errorStack: error?.stack,
              pendingMuteAssert
            },
          }, `Mute re-assert failed: ${error?.message}`);

          // Fall back to server state (see reconciliation effect above)
          if (isLiveEpoch()) dispatch(setPendingMuteAssert(null));
        });
    }
  }, [pendingMuteAssert, pendingMuteAssertEpoch, voice, currentUserVoiceLoading]);

  useEffect(() => {
    return () => {
      if (muteAssertTimeout.current) clearTimeout(muteAssertTimeout.current);
    };
  }, []);

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
  }, [audioError, joinAudio]);

  const toggleVoice = useCallback(async (mutedVal) => {
    const userId = currentUserVoiceData?.user_current[0]?.voice?.userId;
    const currMuted = currentUserVoiceData?.user_current[0]?.voice?.muted;
    const muted = typeof mutedVal === 'boolean' ? mutedVal : !currMuted;

    // Explicit user mute toggle supersedes previous mute asserts
    dispatch(setPendingMuteAssert(null));

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
  }, [micDisabled, audioPermissionTainted, toggleVoice, joinAudio]);

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
