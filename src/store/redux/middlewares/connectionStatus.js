import NetInfo from '@react-native-community/netinfo';
import { connectionStatusChanged } from '../slices/wide-app/client';

let unregisterHandle;

const registerConnectionStatusListeners = () => {
  return (dispatch) => {
    unregisterHandle = NetInfo.addEventListener((connectionInfo) => {
      dispatch(connectionStatusChanged(connectionInfo));
    });
  };
};

const unregisterConnectionStatusListeners = () => {
  return () => typeof unregisterHandle === 'function' && unregisterHandle();
};

export default {
  registerConnectionStatusListeners,
  unregisterConnectionStatusListeners,
};
