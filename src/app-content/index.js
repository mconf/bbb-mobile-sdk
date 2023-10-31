import {
  useEffect, useRef, useState
} from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import notifee, { EventType } from '@notifee/react-native';
import { useDispatch, useSelector } from 'react-redux';
// providers and store
import InCallManager from 'react-native-incall-manager';
import {
  BackHandler, DeviceEventEmitter, Alert, Platform
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { store, injectStoreFlushCallback } from '../store/redux/store';
import * as api from '../services/api';
import DrawerNavigator from '../components/custom-drawer/drawer-navigator';
import EndSessionScreen from '../screens/end-session-screen';
import FeedbackScreen from '../screens/feedback-screen';
import ProblemFeedbackScreen from '../screens/feedback-screen/problem-feedback-screen';
import EmailFeedbackScreen from '../screens/feedback-screen/email-feedback-screen';
import { injectStore as injectStoreVM } from '../services/webrtc/video-manager';
import { injectStore as injectStoreSM } from '../services/webrtc/screenshare-manager';
import { injectStore as injectStoreAM } from '../services/webrtc/audio-manager';
import { injectStore as injectStoreIM } from '../components/interactions/service';
import { ConnectionStatusTracker } from '../store/redux/middlewares';
import { setAudioDevices, setSelectedAudioDevice } from '../store/redux/slices/wide-app/audio';
import Settings from '../../settings.json';
import TestComponentsScreen from '../screens/test-components-screen';
import GuestScreen from '../screens/guest-screen';

import {
  leave,
  setSessionTerminated,
  sessionStateChanged,
} from '../store/redux/slices/wide-app/client';
import logger from '../services/logger';
import { toggleMuteMicrophone } from '../components/audio/service';
import '../utils/locales/i18n';
import Colors from '../constants/colors';

//  Inject store in non-component files
const injectStore = () => {
  injectStoreVM(store);
  injectStoreSM(store);
  injectStoreAM(store);
  injectStoreIM(store);
};

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

const AppContent = ({
  onLeaveSession: _onLeaveSession,
  jUrl,
  defaultLanguage,
  meetingUrl,
}) => {
  const Stack = createNativeStackNavigator();
  const dispatch = useDispatch();
  const guestStatus = useSelector((state) => state.client.guestStatus);
  const audioIsConnected = useSelector((state) => state.audio.isConnected);
  const audioIsMuted = useSelector((state) => state.audio.isMuted);
  const leaveOnUnmount = useSelector((state) => {
    const { sessionState } = state.client;
    return !sessionState.ended
        && (sessionState.connected
          || sessionState.loggedIn
          || sessionState.loggingIn
          || sessionState.loggingOut);
  });
  const [notification, setNotification] = useState(null);
  const navigationRef = useRef(null);
  const nativeEventListeners = useRef([]);
  const leaveOnUnmountRef = useRef();

  const { t, i18n } = useTranslation();

  const onLeaveSession = () => {
    dispatch(setSessionTerminated(true));
    // Custom _onLeaveSession will be called on Redux's store flush @ store.js
    const hasCustomLeaveSession = typeof _onLeaveSession === 'function';
    // The return value of onLeaveSession determines whether there's was a custom
    // leave callback provided by the enveloping app. This is important for the
    // SDK itself to know what to do when the session ends (ie where to navigate
    // from end-session-screen)
    return hasCustomLeaveSession;
  };

  // Store leaveOnUnmount in a ref so we can use it in the unmount function
  useEffect(() => {
    leaveOnUnmountRef.current = leaveOnUnmount;
  }, [leaveOnUnmount]);

  useEffect(() => {
    logger.info({
      logCode: 'app_mounted',
    }, 'App component mounted');

    const onBackPress = () => {
      const navigation = navigationRef?.current;
      if (navigation?.canGoBack()) {
        navigation?.goBack();
      } else {
        Alert.alert(t('app.leaveModal.title'), t('app.leaveModal.desc'), [
          {
            text: t('app.settings.main.cancel.label'),
            onPress: () => { },
            style: 'cancel',
          },
          { text: 'OK', onPress: () => dispatch(leave(api)) },
        ]);
      }

      return true;
    };
    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      logger.info({
        logCode: 'app_unmounted',
      }, 'App component unmounted');
    };
  }, []);

  useEffect(() => {
    const changeLanguage = (lng = 'en') => {
      i18n.changeLanguage(lng)
        .then(() => {
          logger.debug({
            logCode: 'app_locale_change',
          }, 'Change locale sucessfully');
        })
        .catch((err) => {
          logger.debug({
            logCode: 'app_locale_change',
            extraInfo: err,
          }, 'Change locale error');
        });
    };
    changeLanguage(defaultLanguage);
  }, []);

  useEffect(() => {
    if (audioIsConnected) {
      // Start/show the notification foreground service
      const getChannelIdAndDisplayNotification = async () => {
        const channelId = await notifee.createChannel({
          id: 'main_meeting_channel',
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

      if (detail.notification?.android?.channelId !== 'main_meeting_channel') {
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
    // Inject custom provided onLeaveSession callback into the store so it's called
    // once the store's about to be flushed
    if (typeof _onLeaveSession === 'function') injectStoreFlushCallback(_onLeaveSession);
    injectStore();
    dispatch(ConnectionStatusTracker.registerConnectionStatusListeners());
    // Foreground event = device unlocked || app in view
    const unsubscribeForegroundEvents = notifee.onForegroundEvent((event) => {
      const { type, detail } = event;

      if (detail.notification?.android?.channelId !== 'main_meeting_channel') {
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
      dispatch(ConnectionStatusTracker.unregisterConnectionStatusListeners());
      unsubscribeForegroundEvents();

      if (leaveOnUnmountRef.current) {
        dispatch(leave(api)).unwrap().finally(() => {
          dispatch(sessionStateChanged({
            ended: true,
            endReason: 'logged_out',
          }));
          onLeaveSession();
        });
      }
    };
  }, []);

  return (
    <NavigationContainer independent ref={navigationRef}>
      {(guestStatus === 'WAIT') && <GuestScreen />}
      {!Settings.dev && <TestComponentsScreen jUrl={jUrl} />}
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#06172A' }
        }}
      >
        <Stack.Screen name="DrawerNavigator">
          {() => (
            <DrawerNavigator
              navigationRef={navigationRef}
              jUrl={jUrl}
              onLeaveSession={onLeaveSession}
              meetingUrl={meetingUrl}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="EndSessionScreen">
          {() => <EndSessionScreen onLeaveSession={onLeaveSession} />}
        </Stack.Screen>
        <Stack.Screen name="FeedbackScreen" component={FeedbackScreen} />
        <Stack.Screen name="ProblemFeedbackScreen" component={ProblemFeedbackScreen} />
        <Stack.Screen name="EmailFeedbackScreen" component={EmailFeedbackScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppContent;
