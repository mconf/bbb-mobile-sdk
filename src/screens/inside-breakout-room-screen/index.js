import { useCallback, useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { NestedAppContext, useIsBreakoutInstance } from '../../app-instance/context';
import { setMainRoomBlockedByBreakout } from '../../store/redux/slices/wide-app/client';

// A breakout room is a second, nested mount of this very app: the root `App`
// component (obtained through NestedAppContext to avoid an import cycle) with
// `isBreakout`. It builds its own AppInstance - store, Apollo client, LiveKit
// room, WebRTC managers, meeting settings - so it shares nothing with the main
// room, whose media was torn down by breakout-room-screen before navigating
// here and stays suspended through `mainRoomBlockedByBreakout`.
const InsideBreakoutRoomScreen = (props) => {
  const dispatch = useDispatch();
  const { route } = props;
  const { i18n } = useTranslation();
  const navigation = useNavigation();
  const NestedApp = useContext(NestedAppContext);
  const isBreakoutInstance = useIsBreakoutInstance();
  const joinURL = route?.params?.joinURL;

  // Memoized so the nested App's leave callback (and the drawer back handler
  // that depends on it) keeps a stable identity across re-renders.
  const onLeaveSession = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
    dispatch(setMainRoomBlockedByBreakout(false));
  }, [navigation, dispatch]);

  // Safety net: if this screen goes away without the nested App's leave flow
  // having run (main-room navigation, host remount, back handler ordering), the
  // main room must not stay blocked forever.
  useEffect(() => {
    return () => {
      dispatch(setMainRoomBlockedByBreakout(false));
    };
  }, [dispatch]);

  // A breakout cannot open another breakout (defense in depth: a breakout
  // meeting never registers this route in the first place).
  if (isBreakoutInstance || !NestedApp || !joinURL) return null;

  return (
    <NestedApp
      // Re-mount when joining a different breakout while this one is open:
      // navigate() with new params would otherwise reuse the mounted App and
      // its already-completed join.
      key={joinURL}
      joinURL={joinURL}
      isBreakout
      onLeaveSession={onLeaveSession}
      defaultLanguage={i18n.language}
    />
  );
};

export default InsideBreakoutRoomScreen;
