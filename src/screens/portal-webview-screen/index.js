import { View } from 'react-native';
import { WebView } from 'react-native-webview';

const PortalWebviewScreen = () => {
  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ uri: 'https://mconf.github.io/api-mate/#server=https://demo3.bigbluebutton.org/bigbluebutton/&sharedSecret=kiszurkwhDQdAXAnHwCDm2BvdTKpJdUdIfyIXcePQk8' }}
      />
    </View>
  );
};

export default PortalWebviewScreen;
