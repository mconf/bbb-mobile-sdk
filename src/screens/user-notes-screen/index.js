import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import makeCall from '../../services/api/makeCall';
import { selectPadSession } from '../../store/redux/slices/pads-sessions';
import ScreenWrapper from '../../components/screen-wrapper';

const UserNotesScreen = () => {
  const sessionToken = useSelector((state) => state.client.meetingData.sessionToken);
  const padSession = useSelector(selectPadSession);
  const host = useSelector((state) => state.client.meetingData.host);
  const [padId, setPadId] = useState('');

  const url = `https://${host}/pad/auth_session?padName=${padId}&sessionID=${padSession}&lang=pt-br&rtl=false&sessionToken=${sessionToken}`;

  const getPadId = () => {
    makeCall('getPadId', 'notes').then((response) => {
      if (response) {
        setPadId(response[0]);
      }
    });
  };

  const createSession = () => {
    makeCall('createSession', 'notes');
  };

  useEffect(() => {
    createSession();
    getPadId();
  }, []);

  return (
    <ScreenWrapper>
      <View style={{ flex: 1 }}>
        <WebView source={{ uri: url }} />
      </View>
    </ScreenWrapper>
  );
};

export default UserNotesScreen;
