import { View } from 'react-native';
import { WebView } from 'react-native-webview';

const UserNotesScreen = () => {
  return (
    <View style={{ flex: 1 }}>
      <WebView source={{ uri: 'https://rich.etherpad.com/' }} />
    </View>
  );
};

export default UserNotesScreen;
