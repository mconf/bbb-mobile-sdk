import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { OrientationLocker, PORTRAIT } from 'react-native-orientation-locker';
import { store } from './src/store/redux/store';
// components
import InCallManagerController from './src/app-content/in-call-manager';
// import NotifeeController from './src/app-content/notifee';
import LocalesController from './src/app-content/locales';
import AppStatusBar from './src/components/status-bar';
import MainNavigator from './src/screens/main-navigator';
import { disconnectLiveKitRoom } from './src/services/livekit';
// inject stores
import { injectStore as injectStoreVM } from './src/services/webrtc/video-manager';
import { injectStore as injectStoreSM } from './src/services/webrtc/screenshare-manager';
import { injectStore as injectStoreAM } from './src/services/webrtc/audio-manager';
// constants
import './src/utils/locales/i18n';
import Colors from './src/constants/colors';

const injectStore = () => {
  injectStoreVM(store);
  injectStoreSM(store);
  injectStoreAM(store);
};

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.blueBackgroundColor
  },
};

const leaveSessionFactory = (callback = () => {}) => {
  return () => {
    disconnectLiveKitRoom({ final: true });
    callback();
  };
};
const defaultJoinURL = () => '';

const App = (props) => {
  const { joinURL, defaultLanguage, onLeaveSession } = props;
  const _joinURL = joinURL
    || defaultJoinURL();
  const _onLeaveSession = leaveSessionFactory(onLeaveSession);

  useEffect(() => {
    injectStore();
  }, []);

  return (
    <Provider store={store}>
      <NavigationContainer theme={MyTheme} independent>
        <OrientationLocker orientation={PORTRAIT} />
        <MainNavigator
          {...props}
          joinURL={_joinURL}
          onLeaveSession={_onLeaveSession}
        />
        <AppStatusBar />
        <InCallManagerController />
        <LocalesController defaultLanguage={defaultLanguage} />
      </NavigationContainer>
    </Provider>
  );
};

export default App;
