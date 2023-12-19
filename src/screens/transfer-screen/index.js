import React from 'react';
import WebView from 'react-native-webview';
import { View } from 'react-native';

const TransferScreen = (props) => {
  const { transferUrl } = props;
  return (
    <View style={{ flex: 1 }}>
      <WebView source={{ uri: transferUrl }} />
    </View>
  );
};

export default TransferScreen;
