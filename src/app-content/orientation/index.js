import { OrientationLocker } from 'react-native-orientation-locker';
import { getOrientationForRoute } from '../../constants/orientation';

// The app-wide orientation lock. It is the bottom entry of the
// OrientationLocker stack, so any screen that mounts its own
// <OrientationLocker> (e.g. the fullscreen presentation forcing LANDSCAPE)
// still takes precedence while mounted. Before any navigator is ready
// `routeName` is undefined and the policy falls back to portrait.
const OrientationController = ({ routeName }) => (
  <OrientationLocker orientation={getOrientationForRoute(routeName)} />
);

export default OrientationController;
