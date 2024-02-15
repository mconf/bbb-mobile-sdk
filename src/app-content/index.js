import { useEffect, useRef } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { BackHandler, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
// providers and store
import { store, injectStoreFlushCallback } from '../store/redux/store';
import { ConnectionStatusTracker } from '../store/redux/middlewares';
import { leave, setSessionTerminated, sessionStateChanged, } from '../store/redux/slices/wide-app/client';
// components
import DrawerNavigator from '../components/custom-drawer/drawer-navigator';
import EndSessionScreen from '../screens/end-session-screen';
import FeedbackScreen from '../screens/feedback-screen';
import ProblemFeedbackScreen from '../screens/feedback-screen/problem-feedback-screen';
import EmailFeedbackScreen from '../screens/feedback-screen/email-feedback-screen';
import TestComponentsScreen from '../screens/test-components-screen';
import GuestScreen from '../screens/guest-screen';
import TransferScreen from '../screens/transfer-screen';
import InCallManagerController from './in-call-manager';
import LocalesController from './locales';
import NotifeeController from './notifee';
// services
import { injectStore as injectStoreVM } from '../services/webrtc/video-manager';
import { injectStore as injectStoreSM } from '../services/webrtc/screenshare-manager';
import { injectStore as injectStoreAM } from '../services/webrtc/audio-manager';
import { injectStore as injectStoreIM } from '../components/interactions/service';
import * as api from '../services/api';
import logger from '../services/logger';
import Settings from '../../settings.json';

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
  defaultLanguage,
}) => {
  const Stack = createNativeStackNavigator();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const guestStatus = useSelector((state) => state.client.guestStatus);
  const transferUrl = useSelector((state) => state.client.transferUrl);
  const isBreakout = useSelector((state) => state.client.meetingData.isBreakout);
  const navigationRef = useRef(null);

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

  useEffect(() => {
    logger.info({
      logCode: 'app_mounted',
    }, 'App component mounted');

    return () => {
      logger.info({
        logCode: 'app_unmounted',
      }, 'App component unmounted');
    };
  }, []);

  useEffect(() => {
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
      dispatch(leave(api)).unwrap().finally(() => {
        dispatch(sessionStateChanged({
          ended: true,
          endReason: 'logged_out',
        }));
        onLeaveSession();
      });
    };
  }, []);

  if (transferUrl) {
    return (
      <TransferScreen transferUrl={transferUrl} />
    );
  }

  return (
    <>
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
      {!isBreakout && <InCallManagerController />}
      {!isBreakout && <LocalesController defaultLanguage={defaultLanguage} />}
      <NotifeeController />
    </>
  );
};

export default AppContent;
