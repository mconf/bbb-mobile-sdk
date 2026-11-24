import { useCallback, useState } from 'react';
import App from '../../App';
import devPlugins from './dev-plugins';

// The root of a standalone build (index.js, settings.json `dev`). With development
// plugins, it remounts App after a leave, so that the new meeting starts with no
// plugin state.
const DevRoot = () => {
  const [mount, setMount] = useState(0);
  const onLeaveSession = useCallback(() => setMount((n) => n + 1), []);

  if (devPlugins.length === 0) return <App />;
  return <App key={mount} plugins={devPlugins} onLeaveSession={onLeaveSession} />;
};

export default DevRoot;
