import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import Styled from './styles';

const UserNotesScreen = () => {
  return (
    <Styled.ContainerView>
      <Styled.TitleText>
        User notes
      </Styled.TitleText>
    </Styled.ContainerView>
  );
};

export default UserNotesScreen;
