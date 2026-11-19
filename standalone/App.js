import { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import { Provider } from 'react-redux';
import { store } from '../src/store/redux/store';
import ServerInputScreen from '../src/screens/server-input-screen';
import GreenlightWebView from '../src/screens/greenlight-webview';
import Colors from '../src/constants/colors';

/**
 * Standalone app wrapper that provides server URL input and Greenlight room
 * detection before delegating to the core BBB SDK App component.
 *
 * This keeps standalone-specific UI out of the SDK's App.js, which is also
 * used as an embeddable component by host applications.
 */
const StandaloneApp = (props) => {
  const [serverUrl, setServerUrl] = useState(null);
  const [webviewUrl, setWebviewUrl] = useState(null);

  const injectStore = useCallback(() => {
    // Dynamic import to avoid circular deps at module level
    const { injectStore: injectStoreVM } = require('../src/services/webrtc/video-manager');
    const { injectStore: injectStoreSM } = require('../src/services/webrtc/screenshare-manager');
    const { injectStore: injectStoreAM } = require('../src/services/webrtc/audio-manager');
    injectStoreVM(store);
    injectStoreSM(store);
    injectStoreAM(store);
  }, []);

  useEffect(() => {
    injectStore();
  }, [injectStore]);

  // Handle ServerInputScreen submit
  const handleServerSubmit = useCallback((result) => {
    if (result.type === 'webview') {
      setWebviewUrl(result.url);
    } else {
      setServerUrl(result.url);
    }
  }, []);

  // Handle WebView join URL interception
  const handleWebViewJoin = useCallback((bbbJoinUrl) => {
    setServerUrl(bbbJoinUrl);
    setWebviewUrl(null);
  }, []);

  // Go back from WebView to input screen
  const handleWebViewBack = useCallback(() => {
    setWebviewUrl(null);
  }, []);

  // Handle leaving the meeting — reset to input screen
  const handleLeaveSession = useCallback(() => {
    // Clear the server URL so the app returns to the input screen
    setServerUrl(null);
  }, []);

  // Use the core BBB SDK App component for the actual conference
  const { default: CoreApp } = require('../App');

  // If showing WebView for Greenlight room
  if (webviewUrl) {
    return (
      <Provider store={store}>
        <View style={{ flex: 1, backgroundColor: Colors.blueBackgroundColor }}>
          <GreenlightWebView
            roomUrl={webviewUrl}
            onJoinUrl={handleWebViewJoin}
            onBack={handleWebViewBack}
          />
        </View>
      </Provider>
    );
  }

  // If no joinURL provided, show server input screen
  if (!serverUrl) {
    return (
      <Provider store={store}>
        <View style={{ flex: 1, backgroundColor: Colors.blueBackgroundColor }}>
          <ServerInputScreen onSubmit={handleServerSubmit} />
        </View>
      </Provider>
    );
  }

  // Show the core BBB SDK app with the join URL
  return (
    <CoreApp
      {...props}
      joinURL={serverUrl}
      onLeaveSession={handleLeaveSession}
    />
  );
};

export default StandaloneApp;
