import { useSelector } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import Colors from '../../constants/colors';

const AppStatusBar = () => {
  const audioIsConnected = useSelector((state) => state.audio.isConnected);
  const audioIsConnecting = useSelector((state) => state.audio.isConnecting);
  const clientIsDisconnected = useSelector((state) => {
    return !state.client.connected && (state.client.loggedIn || state.client.loggingIn);
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
    <StatusBar backgroundColor={backgroundColor} style={style} />
  );
};

export default AppStatusBar;
