import {
  useEffect, useRef
} from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
// providers and store
import {
  BackHandler, Alert
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
import Settings from '../../settings.json';
import TestComponentsScreen from '../screens/test-components-screen';
import GuestScreen from '../screens/guest-screen';

import {
  leave,
  setSessionTerminated,
  sessionStateChanged,
} from '../store/redux/slices/wide-app/client';
import logger from '../services/logger';

//  Inject store in non-component files
const injectStore = () => {
  injectStoreVM(store);
  injectStoreSM(store);
  injectStoreAM(store);
  injectStoreIM(store);
};

const AppContent = ({
  onLeaveSession: _onLeaveSession,
  jUrl,
  meetingUrl,
}) => {
  const Stack = createNativeStackNavigator();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const guestStatus = useSelector((state) => state.client.guestStatus);
  const leaveOnUnmount = useSelector((state) => {
    const { sessionState } = state.client;
    return !sessionState.ended
        && (sessionState.connected
          || sessionState.loggedIn
          || sessionState.loggingIn
          || sessionState.loggingOut);
  });
  const navigationRef = useRef(null);
  const leaveOnUnmountRef = useRef();

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
    // Inject custom provided onLeaveSession callback into the store so it's called
    // once the store's about to be flushed
    if (typeof _onLeaveSession === 'function') injectStoreFlushCallback(_onLeaveSession);
    injectStore();
    dispatch(ConnectionStatusTracker.registerConnectionStatusListeners());

    return () => {
      dispatch(ConnectionStatusTracker.unregisterConnectionStatusListeners());
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
