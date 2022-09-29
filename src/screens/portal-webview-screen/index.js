import { View } from 'react-native';
import { WebView } from 'react-native-webview';

const PortalWebviewScreen = () => {
  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ uri: 'https://mconf.github.io/api-mate/#server=https://live-oc001.elos.dev/bigbluebutton/&sharedSecret=31RsDSCBqG9npdgeiyHguInURrP54Vai4SdHjFgUH7U' }}
      />
    </View>
  );
};

export default PortalWebviewScreen;
