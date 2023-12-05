import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSelector } from 'react-redux';
import {
  useEffect, useRef, useState
} from 'react';
import axios from 'axios';
import logger from '../../services/logger';

const UserNotesScreen = () => {
  const joinUrl = useSelector((state) => state.client.meetingData.joinUrl);

  const [sharedNotesOnlyJoinUrl, setSharedNotesOnlyJoinUrl] = useState('');
  const webViewRef = useRef();

  useEffect(() => {
    const url = new URL(joinUrl);
    const getJoinUrlWithEnforceLayout = `https://${url.host}/bigbluebutton/api/getJoinUrl?sessionToken=${url.searchParams.get('sessionToken')}&enforceLayout=sharedNotesOnly`;

    axios.get(getJoinUrlWithEnforceLayout).then((response) => {
      const apiResponse = response.data.response;
      if (apiResponse.returncode === 'SUCCESS') {
        setSharedNotesOnlyJoinUrl(apiResponse.url);
      }
    }).catch((e) => {
      logger.warn({
        logCode: 'app_whiteboard_get_enforce_layout_joinUrl_error',
        extraInfo: {
          errorName: e.name,
          errorMessage: e.message,
        },
      }, `Unable to get enforceLayout Join URL: ${e.message}`);
    });

    return () => {
    };
  }, []);

  useEffect(() => {
    webViewRef.current.reload();
  }, [sharedNotesOnlyJoinUrl]);

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={(ref) => { webViewRef.current = ref; }}
        source={{ uri: sharedNotesOnlyJoinUrl }}
      />
    </View>
  );
};

export default UserNotesScreen;
