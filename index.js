import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import Settings from './settings.json';
import { registerGlobals } from '@livekit/react-native';
import DevRoot from './src/plugins/dev-root';
registerGlobals();

import App from './App';

// export for sdk purposes
export default App;

// registerRootComponent calls AppRegistry.registerComponent('main', () => DevRoot);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
// Only register root component if you are running the sdk alone.
if (Settings.dev) {
  registerRootComponent(DevRoot);
}
