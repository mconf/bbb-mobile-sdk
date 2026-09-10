import { PORTRAIT, UNLOCK } from 'react-native-orientation-locker';

// Single source of truth for which screens may follow the device rotation.
// Route names are the deepest focused route reported by the navigation
// container (drawer/stack screen names), so nested navigators (poll,
// participants) resolve to their inner route names and stay portrait.
//
// Only the session-viewing surfaces rotate: the conference itself, the
// fullscreen viewer (webcam / presentation / screenshare) and the embedded
// breakout instance (whose own nested App applies this same policy to its
// inner routes). Everything else (join/lobby, feedback, end session, the
// drawer's forms and lists) is designed as a vertical layout and stays
// portrait.
//
// UNLOCK (not ALL_ORIENTATIONS_BUT_UPSIDE_DOWN) because the Android side of
// react-native-orientation-locker 1.7.0 does not implement the latter.
const ROTATABLE_ROUTES = new Set([
  'Main',
  'FullscreenWrapperScreen',
  'InsideBreakoutRoomScreen',
]);

export const getOrientationForRoute = (routeName) => (
  ROTATABLE_ROUTES.has(routeName) ? UNLOCK : PORTRAIT
);

export default {
  ROTATABLE_ROUTES,
  getOrientationForRoute,
};
