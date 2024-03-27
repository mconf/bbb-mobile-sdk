import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSelector } from 'react-redux';
import { OrientationLocker, LANDSCAPE } from 'react-native-orientation-locker';
import {
  useEffect, useRef, useState
} from 'react';
import axios from 'axios';
import logger from '../../services/logger';

const WhiteboardScreen = () => {
  const joinUrl = useSelector((state) => state.client.meetingData.joinUrl);

  const [presentationOnlyJoinUrl, setPresentationOnlyJoinUrl] = useState('');
  const webViewRef = useRef();

  useEffect(() => {
    const url = new URL(joinUrl);
    const getJoinUrlWithEnforceLayout = `https://${url.host}/bigbluebutton/api/getJoinUrl?sessionToken=${url.searchParams.get('sessionToken')}&enforceLayout=presentationOnly`;

    axios.get(getJoinUrlWithEnforceLayout).then((response) => {
      const apiResponse = response.data.response;
      if (apiResponse.returncode === 'SUCCESS') {
        setPresentationOnlyJoinUrl(apiResponse.url);
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
  }, []);

  useEffect(() => {
    webViewRef?.current?.reload();
  }, [presentationOnlyJoinUrl]);

  if (presentationOnlyJoinUrl === '') {
    return;
  }

  return (
    <View style={{ flex: 1 }}>
      <OrientationLocker orientation={LANDSCAPE} />
      <WebView
        ref={(ref) => { webViewRef.current = ref; }}
        source={{ uri: presentationOnlyJoinUrl }}
        javaScriptEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        allowsFullscreenVideo
      />
    </View>
  );
};

export default WhiteboardScreen;
