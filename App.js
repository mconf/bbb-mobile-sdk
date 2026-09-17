import { useCallback, useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import {
  NavigationContainer, DefaultTheme, NavigationIndependentTree, useNavigationContainerRef
} from '@react-navigation/native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { store } from './src/store/redux/store';
// components
import InCallManagerController from './src/app-content/in-call-manager';
import LocalesController from './src/app-content/locales';
import OrientationController from './src/app-content/orientation';
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

  // The orientation policy is keyed by the deepest focused route, which only
  // the container ref can resolve across the nested stack/drawer navigators.
  const navigationRef = useNavigationContainerRef();
  const [routeName, setRouteName] = useState();
  const syncRouteName = useCallback(() => {
    setRouteName(navigationRef.getCurrentRoute()?.name);
  }, [navigationRef]);

  useEffect(() => {
    injectStore();
  }, []);

  return (
    <KeyboardProvider>
      <Provider store={store}>
        <NavigationIndependentTree>
          <NavigationContainer
            ref={navigationRef}
            theme={MyTheme}
            onReady={syncRouteName}
            onStateChange={syncRouteName}
          >
            <OrientationController routeName={routeName} />
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
    </KeyboardProvider>
  );
};

export default App;
