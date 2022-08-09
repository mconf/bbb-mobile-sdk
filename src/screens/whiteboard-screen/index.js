import { View } from 'react-native';
import { WebView } from 'react-native-webview';

const WhiteboardScreen = () => {
  return (
    <View style={{ flex: 1 }}>
      <WebView source={{ uri: 'https://www.tldraw.com/' }} />
    </View>
  );
};

export default WhiteboardScreen;
