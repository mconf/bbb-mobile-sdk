import { useCallback } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import { useDispatch, useStore } from 'react-redux';
import useMeeting from '../graphql/hooks/useMeeting';
import {
  setAudioError,
  setAudioIntent,
  setMutedState,
  setPendingMuteAssert,
} from '../store/redux/slices/wide-app/audio';
import AudioManager from '../services/webrtc/audio-manager';
import logger from '../services/logger';
import useCurrentUser from '../graphql/hooks/useCurrentUser';

const ANDROID_SDK_MIN_BTCONNECT = 31;

let joinInFlight = null;

export const invalidateInFlightAudioJoin = () => {
  joinInFlight = null;
};

export const useAudioJoin = () => {
  const dispatch = useDispatch();
  const store = useStore();
  const { data: meetingData } = useMeeting();
  const { data: currentUserData } = useCurrentUser();
  const meeting = meetingData?.meeting[0];
  const meetingId = meeting?.meetingId;
  const disableMic = meeting?.lockSettings?.disableMic;
  const muteOnStart = meeting?.voiceSettings?.muteOnStart ?? true;
  const audioBridge = meeting?.audioBridge;
  const currentUserLocked = currentUserData?.user_current[0]?.locked ?? false;

  const doJoinAudio = useCallback(async () => {
    const micDisabled = disableMic && currentUserLocked;
    const transparentListenOnly = true;

    if (Platform.OS === 'android' && Platform.Version >= ANDROID_SDK_MIN_BTCONNECT) {
      const checkStatus = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
      );

      if (checkStatus === false) {
        const permissionStatus = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
        );
        logger.info({
          logCode: 'audio_bluetooth_permission',
          extraInfo: {
            checkStatus,
            permissionStatus,
          }
        }, `Audio had to explicitly request BT permission, result=${permissionStatus}`);
      }
    }

    // Initial audio mute state derivation:
    // - locked/listen-only always joins muted;
    // - a rejoin in the same meeting/session restores the user's current mute
    //   intent (Redux audio.isMuted)
    // - the first join honors muteOnStart.
    // A restored unmute is instead asserted server-side via pendingMuteAssert
    // and reconciled with server stat, both in audio-controls
    const {
      audio: { isMuted: restoredMute, audioIntentMeetingId, audioIntentSessionToken },
      client: { meetingData: { sessionToken } },
    } = store.getState();
    const intentEstablished = audioIntentMeetingId != null
      && audioIntentMeetingId === meetingId
      && audioIntentSessionToken === sessionToken;
    let joinMuted = muteOnStart;

    if (micDisabled) {
      joinMuted = true;
    } else if (intentEstablished) {
      joinMuted = restoredMute || muteOnStart;
    }

    dispatch(setPendingMuteAssert(null));

    return AudioManager.joinMicrophone({
      muted: joinMuted,
      isListenOnly: micDisabled,
      transparentListenOnly,
      audioBridge,
    }).then(() => {
      // If the join was cancelled while in progress, skip.
      if (!AudioManager.bridge) return;

      dispatch(setMutedState(joinMuted));

      if (!micDisabled && meetingId != null) {
        dispatch(setAudioIntent({ meetingId, sessionToken }));

        if (intentEstablished && restoredMute !== muteOnStart) {
          dispatch(setPendingMuteAssert(restoredMute));
        }
      }
    }).catch((error) => {
      logger.error({
        logCode: 'audio_publish_failure',
        extraInfo: {
          errorCode: error.code,
          errorMessage: error.message,
        }
      }, `Audio published failed: ${error.message}`);
      dispatch(setAudioError(error.name));
    });
  }, [disableMic, muteOnStart, audioBridge, currentUserLocked, meetingId, dispatch, store]);

  const joinAudio = useCallback(() => {
    if (joinInFlight) return joinInFlight;

    const join = doJoinAudio().finally(() => {
      // Only detach if this join is still the tracked one. We're relying
      // on useCallback to equality-check here.
      if (joinInFlight === join) joinInFlight = null;
    });

    joinInFlight = join;

    return join;
  }, [doJoinAudio]);

  return { joinAudio };
};
