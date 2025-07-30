import * as Notifications from 'expo-notifications';
import { useMutation } from '@apollo/client';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import logger from '../services/logger';
import LeaveQueries from '../components/custom-drawer/queries';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const NotificationController = () => {
  const [notification, setNotification] = useState()
  const notificationListener = useRef();
  const responseListener = useRef();
  const audioIsConnected = useSelector((state) => state.audio.isConnected);

  const { t } = useTranslation()
  const [dispatchLeaveSession] = useMutation(LeaveQueries.USER_LEAVE_MEETING);

  Notifications.setNotificationChannelAsync('main_meeting_channel', {
    name: t('mobileSdk.notification.label'),
  })

  Notifications.setNotificationCategoryAsync("main", [
    {
      buttonTitle: t('app.leaveModal.confirm'),
      identifier: 'leave',
    },
  ])

  const scheduleNotification = async () => {
    await Notifications.dismissAllNotificationsAsync()
    await Notifications.scheduleNotificationAsync({
      content: {
        title: t('mobileSdk.notification.title'),
        body: t('mobileSdk.notification.body'),
        categoryIdentifier: "main",
      },
      trigger: null,
    });
  }

  useEffect(() => {
    if (audioIsConnected) {
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        setNotification(notification);
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log(response);
      });

      scheduleNotification();
    }

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }

      if (responseListener.current) {
        responseListener.current.remove();
      }

      Notifications.dismissAllNotificationsAsync().catch((error) => {
        logger.error({
          logCode: 'error_dismissing_notifications',
          extraInfo: {
            errorMessage: error?.message,
            errorStack: error?.stack,
          },
        }, `Error dismissing notifications: ${error?.message}`);
      });
    };
  }, [audioIsConnected]);

  useEffect(() => {
    const requestNotificationPermission = async () => {
      await Notifications.requestPermissionsAsync()
    };
    requestNotificationPermission();

  }, []);

  // handle buttons
  Notifications.addNotificationResponseReceivedListener((response) => {
    Notifications.getNotificationCategoriesAsync().then((categories) => {
      if (response.actionIdentifier === "leave") {
        Notifications.dismissAllNotificationsAsync()
        dispatchLeaveSession();
      }
    });
  })

  return null;
};

export default NotificationController;
