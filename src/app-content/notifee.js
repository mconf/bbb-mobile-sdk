import { useEffect, useState } from 'react';
import notifee, { EventType } from '@notifee/react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import * as api from '../services/api';
import { leave } from '../store/redux/slices/wide-app/client';
import logger from '../services/logger';
import { toggleMuteMicrophone } from '../components/audio/service';
import Colors from '../constants/colors';

// Create the foreground service task runner/notification
// this will keep mic working on Android when app is in background/sleep
notifee.registerForegroundService((notification) => {
  return new Promise(() => {
    logger.debug({
      logCode: 'app_service_notification',
      extraInfo: { notification },
    }, 'Foreground service notification started.');
  });
});

const NotifeeController = () => {
  const dispatch = useDispatch();
  const audioIsConnected = useSelector((state) => state.audio.isConnected);
  const audioIsMuted = useSelector((state) => state.audio.isMuted);
  const [notification, setNotification] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (audioIsConnected) {
      // Start/show the notification foreground service
      const getChannelIdAndDisplayNotification = async () => {
        const channelId = await notifee.createChannel({
          id: 'breakout_meeting_channel',
          name: t('mobileSdk.notification.label'),
          vibration: false,
        });

        const _notification = {
          title: t('mobileSdk.notification.title'),
          body: t('mobileSdk.notification.body'),
          id: 'audio_foreground_notification',
          android: {
            channelId,
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
                }
            ],
            asForegroundService: true,
            ongoing: true,
            color: Colors.blue,
            colorized: true,
            smallIcon: 'ic_launcher_foreground',
          },
          ios: {
            foregroundPresentationOptions: {
              banner: false,
            },
          }
        };
        notifee.displayNotification(_notification);
        setNotification(_notification);
      };
      getChannelIdAndDisplayNotification();
    } else {
      // stop notification service
      notifee.stopForegroundService();
    }
  }, [audioIsConnected]);

  useEffect(() => {
    const requestNotificationPermission = async () => {
      await notifee.requestPermission();
    };

    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (notification) {
      if (audioIsMuted) {
        notification.android.actions[1].pressAction.id = 'unmute';
        notification.android.actions[1].title = t('app.actionsBar.unmuteLabel');
        notifee.displayNotification(notification);
        setNotification(notification);
      } else {
        notification.android.actions[1].pressAction.id = 'mute';
        notification.android.actions[1].title = t('app.actionsBar.muteLabel');
        notifee.displayNotification(notification);
        setNotification(notification);
      }
    }
  }, [audioIsMuted]);

  useEffect(() => {
    // Background event = device locked || app not in view || killed/quit
    notifee.onBackgroundEvent(async (event) => {
      const { type, detail } = event;

      if (detail.notification?.android?.channelId !== 'breakout_meeting_channel') {
        return;
      }

      if (type === EventType.ACTION_PRESS && detail.pressAction.id === 'leave') {
        dispatch(leave(api));

        // Remove the notification
        await notifee.cancelNotification(detail.notification.id);
        return;
      }

      // Check if the user pressed the Mute/Unmute button
      if (type === EventType.ACTION_PRESS && (detail.pressAction.id === 'mute' || detail.pressAction.id === 'unmute')) {
        toggleMuteMicrophone();
      }
    });
    return () => {
      notifee.stopForegroundService();
    };
  }, []);

  useEffect(() => {
    // Foreground event = device unlocked || app in view
    const unsubscribeForegroundEvents = notifee.onForegroundEvent((event) => {
      const { type, detail } = event;

      if (detail.notification?.android?.channelId !== 'breakout_meeting_channel') {
        return;
      }

      if (type === EventType.ACTION_PRESS && detail.pressAction.id === 'leave') {
        dispatch(leave(api));
        return;
      }
      if (type === EventType.ACTION_PRESS && (detail.pressAction.id === 'mute' || detail.pressAction.id === 'unmute')) {
        toggleMuteMicrophone();
      }
    });

    return () => {
      unsubscribeForegroundEvents();
    };
  }, []);

  return null;
};

export default NotifeeController;
