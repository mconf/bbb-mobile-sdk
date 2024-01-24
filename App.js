import { Provider } from 'react-redux';
import { OrientationLocker, PORTRAIT } from 'react-native-orientation-locker';
import { store } from './src/store/redux/store';
import AppStatusBar from './src/components/status-bar';
import AppContent from './src/app-content';
import './src/utils/locales/i18n';

const App = (props) => {
  return (
    <Provider store={store}>
      <OrientationLocker orientation={PORTRAIT} />
      <AppContent {...props} />
      <AppStatusBar />
    </Provider>
  );
};

export default App;
