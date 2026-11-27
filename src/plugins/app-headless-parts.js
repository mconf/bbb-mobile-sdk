import { useSelector } from 'react-redux';
import { useAppInstance } from '../app-instance/context';
import { PluginHeadlessParts } from './headless-parts';

// The active plugins' Headless parts in this App, while the user is in the
// meeting. loggedIn turns false on a leave, at the meeting's end or on removal,
// before the feedback screens open. Android's back button leaves with the App.
const AppPluginHeadlessParts = () => {
  const { pluginActivation, pluginHostLog } = useAppInstance();
  const loggedIn = useSelector((state) => state.client.sessionState.loggedIn);

  return (
    <PluginHeadlessParts
      activation={pluginActivation}
      enabled={loggedIn}
      log={pluginHostLog.write}
    />
  );
};

export default AppPluginHeadlessParts;
