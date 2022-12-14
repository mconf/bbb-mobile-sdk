import { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { Provider, useDispatch, useSelector } from 'react-redux';
// providers and store
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
}) => {
  const Stack = createNativeStackNavigator();
  const dispatch = useDispatch();
  const guestStatus = useSelector((state) => state.client.guestStatus);
  const ended = useSelector((state) => state.client.sessionState.ended);
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
    injectStore();
    dispatch(ConnectionStatusTracker.registerConnectionStatusListeners());

    return () => {
      dispatch(ConnectionStatusTracker.unregisterConnectionStatusListeners());

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
    };
  }, []);

  return (
    <>
      <NavigationContainer independent>
        {(guestStatus === 'WAIT') && <GuestScreen />}
        {!Settings.dev && <TestComponentsScreen jUrl={jUrl} />}
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#06172A' }
          }}
        >
          <Stack.Screen name="DrawerNavigator">
            {() => <DrawerNavigator jUrl={jUrl} onLeaveSession={onLeaveSession} />}
          </Stack.Screen>
          <Stack.Screen name="EndSessionScreen">
            {() => <EndSessionScreen onLeaveSession={onLeaveSession} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
      <FullscreenWrapper />
    </>
  );
};

const App = (props) => {
  return (
    <Provider store={store}>
      <AppContent {...props} />
      <AppStatusBar />
    </Provider>
  );
};

export default App;
