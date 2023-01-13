import { useEffect, useRef, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import notifee, { EventType } from '@notifee/react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';
// providers and store
import { useKeepAwake } from 'expo-keep-awake';
import HeadphoneDetection from 'react-native-headphone-detection';
import { Audio } from 'expo-av';
import { LogBox } from 'react-native';
import { store } from './src/store/redux/store';
import * as api from './src/services/api';
import DrawerNavigator from './src/components/custom-drawer/drawer-navigator';
import FullscreenWrapper from './src/components/fullscreen-wrapper';
import EndSessionScreen from './src/screens/end-session-screen';
import AppStatusBar from './src/components/status-bar';
import { injectStore as injectStoreVM } from './src/services/webrtc/video-manager';
import { injectStore as injectStoreSM } from './src/services/webrtc/screenshare-manager';
import { injectStore as injectStoreAM } from './src/services/webrtc/audio-manager';
import { injectStore as injectStoreIM } from './src/components/interactions/service';
import { ConnectionStatusTracker } from './src/store/redux/middlewares';
import Settings from './settings.json';
import TestComponentsScreen from './src/screens/test-components-screen';
import GuestScreen from './src/screens/guest-screen';
import {
  leave,
  setSessionTerminated,
  sessionStateChanged,
} from './src/store/redux/slices/wide-app/client';
import logger from './src/services/logger';
import { toggleMuteMicrophone } from './src/components/audio/service';
import Colors from './src/constants/colors';

// FIXME ignore NativeEventEmitter warnings - they stem from outdated calls
// in HeadphoneDetection. This needs to be figured out later - prlanzarin
LogBox.ignoreLogs(['new NativeEventEmitter()']);

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
}) => {
  const Stack = createNativeStackNavigator();
  const dispatch = useDispatch();
  const guestStatus = useSelector((state) => state.client.guestStatus);
  const audioIsConnected = useSelector((state) => state.audio.isConnected);
  const audioIsMuted = useSelector((state) => state.audio.isMuted);
  const ended = useSelector((state) => state.client.sessionState.ended);
  const [notification, setNotification] = useState(null);
  const navigationRef = useRef(null);
  const onLeaveSession = () => {
    dispatch(setSessionTerminated(true));
    const hasCustomLeaveSession = typeof _onLeaveSession === 'function';

    if (hasCustomLeaveSession) _onLeaveSession();

    // The return value of onLeaveSession determines whether there's was a custom
    // leave callback provided by the enveloping app. This is important for the
    // SDK itself to know what to do when the session ends (ie where to navigate
    // from end-session-screen)
    return hasCustomLeaveSession;
  };

  useEffect(() => {
    if (audioIsConnected) {
      // Start/show the notification foreground service
      const getChannelIdAndDisplayNotification = async () => {
        // Request permissions (required for iOS)
        await notifee.requestPermission();

        const channelId = await notifee.createChannel({
          id: 'inconference',
          // TODO localization
          name: 'Em Conferência',
          vibration: false,
        });

        // TODO localization
        const _notification = {
          title: 'Conferência em andamento',
          body: 'Você está participando de uma conferência. Toque para abrir',
          id: 'audio_foreground_notification',
          android: {
            channelId,
            pressAction: {
              id: 'default',
            },
            actions: [
              {
                title: 'Sair',
                pressAction: {
                  id: 'leave',
                },
              },
              audioIsMuted
                ? {
                  title: 'Falar',
                  pressAction: {
                    id: 'unmute',
                  },
                } : {
                  title: 'Silenciar',
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
    if (notification) {
      if (audioIsMuted) {
        notification.android.actions[1].pressAction.id = 'unmute';
        notification.android.actions[1].title = 'Falar';
        notifee.displayNotification(notification);
        setNotification(notification);
      } else {
        notification.android.actions[1].pressAction.id = 'mute';
        notification.android.actions[1].title = 'Silenciar';
        notifee.displayNotification(notification);
        setNotification(notification);
      }
    }
  }, [audioIsMuted]);

  useEffect(() => {
    // Background event = device locked || app not in view || killed/quit
    notifee.onBackgroundEvent(async ({ type, detail }) => {
      if (type === EventType.ACTION_PRESS && detail.pressAction.id === 'leave') {
        dispatch(leave(api));

        // Remove the notification
        await notifee.cancelNotification(detail.notification.id);
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
    injectStore();
    dispatch(ConnectionStatusTracker.registerConnectionStatusListeners());

    const handleAudioDeviceChangeFailure = (error) => {
      logger.error({
        logCode: 'app_audio_device_change_failure',
        extraInfo: {
          errorMessage: error.message,
          errorCode: error.code
        },
      }, `Failure handling audio device change: ${error.message || error.name}`);
    };

    const handleAudioDeviceChange = ({ audioJack, bluetooth }) => {
      const hasExternalDevice = audioJack === true || bluetooth === true;

      logger.debug({
        logCode: 'app_audio_device_change_event',
        extraInfo: {
          audioJack,
          bluetooth,
        },
      }, `Audio device change: audioJack=${audioJack} bluetooth=${bluetooth}`);

      return Audio.setAudioModeAsync({
        allowsRecordingIOS: hasExternalDevice,
        playThroughEarpieceAndroid: hasExternalDevice,
      }).catch(handleAudioDeviceChangeFailure);
    };

    // Define current connected device on mount
    HeadphoneDetection.isAudioDeviceConnected()
      .then(handleAudioDeviceChange)
      .catch(handleAudioDeviceChangeFailure);
    // Listen for subsequent device changes
    HeadphoneDetection.addListener(handleAudioDeviceChange);

    // Foreground event = device unlocked || app in view
    const unsubscribeForegroundEvents = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.ACTION_PRESS && detail.pressAction.id === 'leave') {
        dispatch(leave(api));
      }
      if (type === EventType.ACTION_PRESS && (detail.pressAction.id === 'mute' || detail.pressAction.id === 'unmute')) {
        toggleMuteMicrophone();
      }
      if (type === EventType.PRESS) {
        navigationRef?.current?.navigate('Main');
      }
    });

    return () => {
      dispatch(ConnectionStatusTracker.unregisterConnectionStatusListeners());

      if (HeadphoneDetection.remove) HeadphoneDetection.remove();

      if (!ended) {
        dispatch(sessionStateChanged({
          ended: true,
          endReason: 'logged_out',
        }));
      }

      dispatch(leave(api)).unwrap().catch(() => {
        dispatch(setSessionTerminated(true));
      });
      dispatch(setSessionTerminated(true));
      unsubscribeForegroundEvents();
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
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="EndSessionScreen">
          {() => <EndSessionScreen onLeaveSession={onLeaveSession} />}
        </Stack.Screen>
        <Stack.Screen name="FullscreenWrapper" component={FullscreenWrapper} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = (props) => {
  useKeepAwake();
  return (
    <Provider store={store}>
      <AppContent {...props} />
      <AppStatusBar />
    </Provider>
  );
};

export default App;
