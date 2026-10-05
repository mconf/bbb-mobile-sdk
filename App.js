import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer, DefaultTheme, NavigationIndependentTree } from '@react-navigation/native';
import { OrientationLocker, PORTRAIT } from 'react-native-orientation-locker';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useFonts } from 'expo-font';
import { PaperProvider } from 'react-native-paper';
import { store } from './src/store/redux/store';
// components
import InCallManagerController from './src/app-content/in-call-manager';
import LocalesController from './src/app-content/locales';
import AppStatusBar from './src/components/status-bar';
import NavigatorHandler from './src/screens/navigator-handler';
import { disconnectLiveKitRoom } from './src/services/livekit';
// inject stores
import { injectStore as injectStoreVM } from './src/services/webrtc/video-manager';
import { injectStore as injectStoreSM } from './src/services/webrtc/screenshare-manager';
import { injectStore as injectStoreAM } from './src/services/webrtc/audio-manager';
// constants
import './src/utils/locales/i18n';
import Colors from './src/constants/colors';
import { FONT_ASSETS, navigationFonts } from './src/constants/fonts';
import paperTheme from './src/constants/paper-theme';

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
  fonts: navigationFonts,
};

const leaveSessionFactory = (callback = () => { }) => {
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

  // Nunito Sans is the app's default typeface; hold rendering until the faces
  // are registered so no screen flashes the system font. On failure, render
  // anyway with the platform fallback.
  const [fontsLoaded, fontsError] = useFonts(FONT_ASSETS);

  useEffect(() => {
    injectStore();
  }, []);

  if (!fontsLoaded && !fontsError) return null;

  return (
    <KeyboardProvider>
      <PaperProvider theme={paperTheme}>
        <Provider store={store}>
          <NavigationIndependentTree>
            <NavigationContainer theme={MyTheme}>
              <OrientationLocker orientation={PORTRAIT} />
              <NavigatorHandler
                {...props}
                joinURL={_joinURL}
                onLeaveSession={_onLeaveSession}
              />
              <AppStatusBar />
              <InCallManagerController />
              <LocalesController defaultLanguage={defaultLanguage} />
            </NavigationContainer>
          </NavigationIndependentTree>
        </Provider>
      </PaperProvider>
    </KeyboardProvider>
  );
};

export default App;
