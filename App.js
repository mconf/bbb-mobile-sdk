import { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { Provider, useDispatch, useSelector } from 'react-redux';
// providers and store
import { store } from './src/store/redux/store';
import { leave, setSessionTerminated } from './src/store/redux/slices/wide-app/client';
import * as api from './src/services/api';
// screens
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

//  Inject store in non-component files
const injectStore = () => {
  injectStoreVM(store);
  injectStoreSM(store);
  injectStoreAM(store);
  injectStoreIM(store);
};

const AppContent = ({
  _onLeaveSession,
  jUrl,
}) => {
  const Stack = createNativeStackNavigator();
  const dispatch = useDispatch();
  const guestStatus = useSelector((state) => state.client.guestStatus);
  const onLeaveSession = () => {
    dispatch(setSessionTerminated(true));
    if (typeof _onLeaveSession === 'function') _onLeaveSession();
  };

  useEffect(() => {
    injectStore();
    dispatch(ConnectionStatusTracker.registerConnectionStatusListeners());

    return () => {
      dispatch(ConnectionStatusTracker.unregisterConnectionStatusListeners());
      dispatch(leave(api)).finally(onLeaveSession);
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
