import { useSelector } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import Colors from '../../constants/colors';

const AppStatusBar = () => {
  const fullscreenActive = useSelector((state) => state.layout.isFocused);
  const audioIsConnected = useSelector((state) => state.audio.isConnected);
  const audioIsConnecting = useSelector((state) => {
    return state.audio.isConnecting || state.audio.isReconnecting;
  });
  const clientIsDisconnected = useSelector(({ client }) => {
    return !client.sessionState.connected
      && (client.sessionState.loggingIn
        || (client.sessionState.loggedIn && !client.sessionState.loggingOut));
  });
  const statusBarConnected = audioIsConnected && !clientIsDisconnected;
  const statusBarConnecting = audioIsConnecting || clientIsDisconnected;
  const style = statusBarConnecting ? 'dark' : 'light';
  const backgroundColor = statusBarConnected
    ? Colors.statusBarConnected
    : statusBarConnecting
      ? Colors.statusBarConnecting
      : null;

  return (
    <StatusBar backgroundColor={backgroundColor} style={style} hidden={fullscreenActive} />
  );
};

export default AppStatusBar;
