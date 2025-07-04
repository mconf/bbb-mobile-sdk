import React, { forwardRef } from 'react';
import { WebView } from 'react-native-webview';

const WebViewPlayer = forwardRef(({ url }, ref) => {
  return (
    <WebView
      ref={ref}
      source={{ uri: url }}
      style={{ width: '100%', height: 200 }}
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
    />
  );
});

export default WebViewPlayer;
