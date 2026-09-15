import { useCallback, useEffect, useRef } from 'react';
import { AppState, Platform, PermissionsAndroid } from 'react-native';
import notifee, { AndroidForegroundServiceType, EventType } from 'react-native-notify-kit';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation, useSubscription } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import AudioQueries from '../components/audio/audio-controls/queries';
import LeaveQueries from '../components/custom-drawer/queries';
import useCurrentUser from '../graphql/hooks/useCurrentUser';
import { setPendingMuteAssert } from '../store/redux/slices/wide-app/audio';
import { stampMuteCommand } from '../services/webrtc/mute-intent.ts';
import logger from '../services/logger';
import Colors from '../constants/colors';

const CHANNEL_ID = 'main_meeting_channel';
// Fixed id: the breakout instance's notification replaces the main room's
// instead of duplicating it (two full app instances run during breakouts)
const NOTIFICATION_ID = 'audio_notification_main';
// Android won't restart the service from the background, so its stop waits for a
// possible rejoin. The longer delay covers a join in progress, but not forever.
const SERVICE_STOP_DELAY_MS = 15000;
const SERVICE_RECOVERY_CEILING_MS = 90000;

// Foreground service task runner/notification: keeps audio/mic working on
// Android when the app is backgrounded or the screen is off. The promise
// never resolves on purpose - the service lives until stopForegroundService.
notifee.registerForegroundService((notification) => {
  return new Promise(() => {
    logger.debug({
      logCode: 'app_service_notification',
      extraInfo: { notification },
    }, 'Foreground service notification started.');
  });
});

// Android 14+ requires the started types to be a subset of the manifest
// declaration AND backed by granted permissions - starting a microphone-typed
// FGS without RECORD_AUDIO throws a SecurityException (e.g. listen-only users)
const getServiceTypes = async (isListenOnly) => {
  const types = [AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK];

  if (!isListenOnly) {
    try {
      const hasMicPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      );
      if (hasMicPermission) {
        types.push(AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_MICROPHONE);
      }
    } catch (error) {
      logger.warn({
        logCode: 'notifee_mic_permission_check_failed',
        extraInfo: { errorMessage: error?.message },
      }, 'Failed to check mic permission for foreground service types');
    }
  }

  return types;
};

const NotifeeController = () => {
  const dispatch = useDispatch();
  const audioIsConnected = useSelector((state) => state.audio.isConnected);
  const audioIsMuted = useSelector((state) => state.audio.isMuted);
  const isListenOnly = useSelector((state) => state.audio.isListenOnly);
  const mediaInterrupted = useSelector((state) => state.audio.mediaInterrupted);
  const audioRecovering = useSelector((state) => state.audio.isConnecting
    || state.audio.isReconnecting);
  const pendingMuteAssert = useSelector((state) => state.audio.pendingMuteAssert);
  // The breakout instance reuses this service and notification id, so a late stop
  // here would kill its service.
  const sessionActive = useSelector(({ client }) => client.sessionState.connected
    && client.sessionState.loggedIn
    && !client.sessionState.mainRoomBlockedByBreakout);
  const audioIntentSet = useSelector((state) => state.audio.audioIntentMeetingId != null);
  const { t } = useTranslation();
  const [userSetMuted] = useMutation(AudioQueries.USER_SET_MUTED);
  const [dispatchLeaveSession] = useMutation(LeaveQueries.USER_LEAVE_MEETING);
  const { data: currentUserVoiceData } = useSubscription(AudioQueries.USER_CURRENT_VOICE);
  const { data: currentUserData } = useCurrentUser();
  const voice = currentUserVoiceData?.user_current[0]?.voice;
  const currentUserId = currentUserData?.user_current[0]?.userId;
  const displayedMuted = pendingMuteAssert !== null
    ? audioIsMuted
    : (voice?.muted ?? audioIsMuted);
  const serviceStopTimer = useRef(null);
  const serviceStopDelay = useRef(null);
  const serviceRunning = useRef(false);
  const intentWhileConnected = useRef(false);
  const fgsStartFailed = useRef(false);

  const toggleMute = useCallback(async () => {
    // Only unmuting is refused while the session is down (mirrors audio-controls).
    if (mediaInterrupted && displayedMuted) return;

    // Explicit user mute toggle supersedes previous mute asserts
    // (mirrors audio-controls' toggleVoice)
    dispatch(setPendingMuteAssert(null));

    try {
      stampMuteCommand(!displayedMuted);
      await userSetMuted({
        variables: {
          muted: !displayedMuted,
          userId: voice?.userId ?? currentUserId,
        },
      });
    } catch (error) {
      logger.error({
        logCode: 'notifee_toggle_mute_failed',
        extraInfo: { errorMessage: error?.message },
      }, 'Error on trying to toggle muted from notification');
    }
  }, [voice, displayedMuted, currentUserId, mediaInterrupted]);

  const leave = useCallback(async () => {
    try {
      await dispatchLeaveSession();
    } catch (error) {
      logger.error({
        logCode: 'notifee_leave_failed',
        extraInfo: { errorMessage: error?.message },
      }, 'Error on trying to leave session from notification');
    } finally {
      serviceRunning.current = false;
      await notifee.stopForegroundService();
      await notifee.cancelNotification(NOTIFICATION_ID);
    }
  }, [dispatchLeaveSession]);

  // notifee's onBackgroundEvent handler is global and cannot be unregistered,
  // so route events through a ref holding the latest callbacks
  const handlersRef = useRef({ toggleMute, leave });
  handlersRef.current = { toggleMute, leave };

  const display = useCallback(async () => {
    const channelId = await notifee.createChannel({
      id: CHANNEL_ID,
      name: t('mobileSdk.notification.label'),
      vibration: false,
    });

    const buildNotification = (foregroundServiceTypes) => ({
      id: NOTIFICATION_ID,
      title: t('mobileSdk.notification.title'),
      body: t('mobileSdk.notification.body'),
      android: {
        channelId,
        asForegroundService: true,
        foregroundServiceTypes,
        ongoing: true,
        pressAction: {
          id: 'default',
        },
        actions: [
          {
            title: t('app.leaveModal.confirm'),
            pressAction: {
              id: 'leave',
            },
          },
          ...(isListenOnly ? [] : [
            audioIsMuted
              ? {
                title: t('app.actionsBar.unmuteLabel'),
                pressAction: {
                  id: 'unmute',
                },
              } : {
                title: t('app.actionsBar.muteLabel'),
                pressAction: {
                  id: 'mute',
                },
              },
          ]),
        ],
        color: Colors.blue,
        colorized: true,
        smallIcon: 'ic_launcher_foreground',
      },
    });

    try {
      await notifee.displayNotification(buildNotification(await getServiceTypes(isListenOnly)));
    } catch (error) {
      logger.warn({
        logCode: 'notifee_fgs_display_failed',
        extraInfo: { errorMessage: error?.message },
      }, 'Foreground service with mic type failed, retrying as mediaPlayback-only');

      try {
        await notifee.displayNotification(buildNotification(
          [AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK],
        ));
      } catch (retryError) {
        fgsStartFailed.current = true;
        logger.error({
          logCode: 'notifee_fgs_display_retry_failed',
          extraInfo: { errorMessage: retryError?.message },
        }, 'Failed to start the audio foreground service');
      }
    }
  }, [audioIsMuted, isListenOnly, t]);

  // Start/stop the foreground service with the audio connection; re-display on
  // mute changes so the mute/unmute action label stays in sync (same id
  // updates the notification in place)
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const clearStopTimer = () => {
      clearTimeout(serviceStopTimer.current);
      serviceStopTimer.current = null;
      serviceStopDelay.current = null;
    };

    const stopService = () => {
      clearStopTimer();
      intentWhileConnected.current = false;
      // The breakout instance may own the service by now.
      if (!serviceRunning.current) return;

      serviceRunning.current = false;
      notifee.stopForegroundService();
      notifee.cancelNotification(NOTIFICATION_ID);
    };

    if (!sessionActive) {
      stopService();

      return;
    }

    if (audioIsConnected) {
      clearStopTimer();
      // Remembered because leaving audio can clear the intent a render before
      // audioIsConnected drops.
      if (audioIntentSet) intentWhileConnected.current = true;
      serviceRunning.current = true;
      display();

      return;
    }

    if (!serviceRunning.current) return;

    // Leaving audio on purpose clears the audio intent; a forced reconnect keeps it.
    if (intentWhileConnected.current && !audioIntentSet) {
      stopService();

      return;
    }

    // No stop while the room is down: its reconnect can outlast any fixed delay.
    if (mediaInterrupted) {
      clearStopTimer();
    } else {
      const delay = audioRecovering ? SERVICE_RECOVERY_CEILING_MS : SERVICE_STOP_DELAY_MS;
      if (serviceStopTimer.current && serviceStopDelay.current !== delay) clearStopTimer();
      if (!serviceStopTimer.current) {
        serviceStopDelay.current = delay;
        serviceStopTimer.current = setTimeout(stopService, delay);
      }
    }
  }, [audioIsConnected, sessionActive, mediaInterrupted, audioIntentSet, display]);

  // Retry a service start that failed while the app was in the background.
  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;

    const subscription = AppState.addEventListener('change', (next) => {
      if (next !== 'active' || !fgsStartFailed.current || !serviceRunning.current) return;

      fgsStartFailed.current = false;
      display();
    });

    return () => subscription.remove();
  }, [display]);

  useEffect(() => {
    // POST_NOTIFICATIONS runtime prompt (Android 13+)
    notifee.requestPermission();

    // Background event = device locked || app not in view || killed/quit
    notifee.onBackgroundEvent(async ({ type, detail }) => {
      if (detail.notification?.android?.channelId !== CHANNEL_ID) return;
      if (type !== EventType.ACTION_PRESS) return;

      if (detail.pressAction.id === 'leave') {
        await handlersRef.current.leave();
      } else if (detail.pressAction.id === 'mute' || detail.pressAction.id === 'unmute') {
        await handlersRef.current.toggleMute();
      }
    });

    // Foreground event = device unlocked || app in view
    const unsubscribeForegroundEvents = notifee.onForegroundEvent(({ type, detail }) => {
      if (detail.notification?.android?.channelId !== CHANNEL_ID) return;
      if (type !== EventType.ACTION_PRESS) return;

      if (detail.pressAction.id === 'leave') {
        handlersRef.current.leave();
      } else if (detail.pressAction.id === 'mute' || detail.pressAction.id === 'unmute') {
        handlersRef.current.toggleMute();
      }
    });

    return () => {
      unsubscribeForegroundEvents();
      clearTimeout(serviceStopTimer.current);
      serviceRunning.current = false;

      if (Platform.OS === 'android') {
        notifee.stopForegroundService();
        notifee.cancelNotification(NOTIFICATION_ID);
      }
    };
  }, []);

  return null;
};

export default NotifeeController;
