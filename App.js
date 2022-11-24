import { StatusBar } from 'expo-status-bar';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
// providers and store
import { store } from './src/store/redux/store';
// screens
import DrawerNavigator from './src/components/custom-drawer/drawer-navigator';
import FullscreenWrapper from './src/components/fullscreen-wrapper';
import EndSessionScreen from './src/screens/end-session-screen';
import { injectStore as injectStoreVM } from './src/services/webrtc/video-manager';
import { injectStore as injectStoreSM } from './src/services/webrtc/screenshare-manager';
import { injectStore as injectStoreAM } from './src/services/webrtc/audio-manager';
import { injectStore as injectStoreIM } from './src/components/interactions/service';

//  Inject store in non-component files
const injectStore = () => {
  injectStoreVM(store);
  injectStoreSM(store);
  injectStoreAM(store);
  injectStoreIM(store);
};

const App = ({ onLeaveSession, jUrl }) => {
  injectStore();
  const Stack = createNativeStackNavigator();

  return (
    <>
      <Provider store={store}>
        <NavigationContainer independent>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#06172A' }
            }}
          >
            {/*<Stack.Screen name="GuestScreen" component={GuestScreen} />*/}
            <Stack.Screen name="DrawerNavigator">
              {() => <DrawerNavigator jUrl={jUrl} onLeaveSession={onLeaveSession} />}
            </Stack.Screen>
            <Stack.Screen name="EndSessionScreen" component={EndSessionScreen} />
          </Stack.Navigator>
        </NavigationContainer>
        <FullscreenWrapper />
      </Provider>
      <StatusBar style="light" />
    </>
  );
};

export default App;
