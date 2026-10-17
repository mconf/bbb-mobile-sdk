import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import Settings from './settings.json';
import { registerGlobals } from '@livekit/react-native';
registerGlobals();

import App from './App';

// export for sdk purposes (host apps import this)
export default App;

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
// Only register root component if you are running the sdk alone.
if (Settings.dev) {
  // In standalone/dev mode, use the standalone wrapper which provides
  // server URL input and Greenlight room detection
  const StandaloneApp = require('./standalone/App').default;
  registerRootComponent(StandaloneApp);
}
