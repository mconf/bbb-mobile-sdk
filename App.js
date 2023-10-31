import { Provider } from 'react-redux';
import { store } from './src/store/redux/store';
import AppStatusBar from './src/components/status-bar';
import AppContent from './src/app-content';
import './src/utils/locales/i18n';

const App = (props) => {
  return (
    <Provider store={store}>
      <AppContent {...props} />
      <AppStatusBar />
    </Provider>
  );
};

export default App;
