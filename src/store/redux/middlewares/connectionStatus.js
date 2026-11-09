import NetInfo from '@react-native-community/netinfo';
import { connectionStatusChanged } from '../slices/wide-app/client';

// Thunk factories for the NetInfo listener. The unsubscribe handle lives in a
// closure per tracker (one per store) instead of a module-level variable, so
// two App instances never overwrite each other's handle.
const createConnectionStatusTracker = () => {
  let unregisterHandle;

  const registerConnectionStatusListeners = () => {
    return (dispatch) => {
      if (typeof unregisterHandle === 'function') unregisterHandle();
      unregisterHandle = NetInfo.addEventListener((connectionInfo) => {
        dispatch(connectionStatusChanged(connectionInfo));
      });
    };
  };

  const unregisterConnectionStatusListeners = () => {
    return () => {
      if (typeof unregisterHandle === 'function') unregisterHandle();
      unregisterHandle = undefined;
    };
  };

  return {
    registerConnectionStatusListeners,
    unregisterConnectionStatusListeners,
  };
};

export default createConnectionStatusTracker;
