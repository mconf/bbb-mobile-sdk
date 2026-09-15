import { useEffect, useMemo, useState } from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer, DefaultTheme, NavigationIndependentTree } from '@react-navigation/native';
import { OrientationLocker, PORTRAIT } from 'react-native-orientation-locker';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useFonts } from 'expo-font';
import { PaperProvider } from 'react-native-paper';
// per-App instance (store, LiveKit room, WebRTC managers, meeting settings)
import { createAppInstance } from './src/app-instance/create-app-instance';
import { AppInstanceProvider, NestedAppContext } from './src/app-instance/context';
import { pushActiveInstance, popActiveInstance } from './src/app-instance/active-instance';
// components
import InCallManagerController from './src/app-content/in-call-manager';
import LocalesController from './src/app-content/locales';
import AppStatusBar from './src/components/status-bar';
import NavigatorHandler from './src/screens/navigator-handler';
// constants
import './src/utils/locales/i18n';
import Colors from './src/constants/colors';
import { FONT_ASSETS, navigationFonts } from './src/constants/fonts';
import paperTheme from './src/constants/paper-theme';

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.blueBackgroundColor
  },
  fonts: navigationFonts,
};

// Leaving always tears this instance's media down first (room + managers) and
// only then hands control back to whoever mounted us (the host app, or the
// main room's inside-breakout-room-screen). Awaited so that, for a breakout,
// the nested instance's audio/InCallManager/notification state has settled
// before the main room resumes its own media.
const leaveSessionFactory = (instance, callback = () => { }) => {
  return async () => {
    try {
      await instance.disconnectLiveKit({ final: true });
    } finally {
      callback();
    }
  };
};
const defaultJoinURL = () => '';

// `App` is both the standalone app root (index.js) and the embeddable SDK
// component. A breakout room is this same component mounted a second time,
// by inside-breakout-room-screen, with `isBreakout` - each mount owns an
// AppInstance, so the two never share a store, a LiveKit room or a manager.
const App = (props) => {
  const {
    joinURL, defaultLanguage, onLeaveSession, isBreakout = false,
  } = props;
  const _joinURL = joinURL
    || defaultJoinURL();
  // useState initializer (not useMemo): the instance - and its LiveKit Room -
  // must be created exactly once per mount. @livekit/react-native disconnects
  // the room whenever the `room` prop identity changes.
  const [instance] = useState(() => createAppInstance({ isBreakout: !!isBreakout }));
  // Memoized: the drawer's hardware-back effect depends on it, and a new
  // function per render would re-register that handler on every render.
  const _onLeaveSession = useMemo(
    () => leaveSessionFactory(instance, onLeaveSession),
    [instance, onLeaveSession],
  );

  // Nunito Sans is the app's default typeface; hold rendering until the faces
  // are registered so no screen flashes the system font. On failure, render
  // anyway with the platform fallback.
  const [fontsLoaded, fontsError] = useFonts(FONT_ASSETS);

  useEffect(() => {
    pushActiveInstance(instance);

    return () => {
      popActiveInstance(instance);
      instance.dispose();
    };
  }, [instance]);

  const tree = (
    <AppInstanceProvider value={instance}>
      <NestedAppContext.Provider value={App}>
        <Provider store={instance.store}>
          <NavigationIndependentTree>
            <NavigationContainer theme={MyTheme}>
              <OrientationLocker orientation={PORTRAIT} />
              <NavigatorHandler
                {...props}
                joinURL={_joinURL}
                onLeaveSession={_onLeaveSession}
              />
              {/* Process-wide controllers: one owner, the outermost App. The
                  status bar is a single native resource, and i18next is one
                  shared instance (a nested App inherits the parent's language). */}
              {!isBreakout && <AppStatusBar />}
              <InCallManagerController />
              {!isBreakout && <LocalesController defaultLanguage={defaultLanguage} />}
            </NavigationContainer>
          </NavigationIndependentTree>
        </Provider>
      </NestedAppContext.Provider>
    </AppInstanceProvider>
  );

  // One KeyboardProvider/PaperProvider at the root, and the fonts are already
  // registered by then; a nested (breakout) App consumes the parent's.
  if (isBreakout) return tree;

  if (!fontsLoaded && !fontsError) return null;

  return (
    <KeyboardProvider>
      <PaperProvider theme={paperTheme}>
        {tree}
      </PaperProvider>
    </KeyboardProvider>
  );
};

export default App;
