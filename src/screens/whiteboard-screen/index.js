import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSelector } from 'react-redux';
import {
  useEffect, useRef, useState
} from 'react';
import axios from 'axios';
import { setAdjustPan, setAdjustResize } from 'rn-android-keyboard-adjust';
import logger from '../../services/logger';
import useMeetingSettings from '../../graphql/local-states/useMeetingSettings';

const WhiteboardScreen = () => {
  const joinUrl = useSelector((state) => state.client.meetingData.joinUrl);
  const host = useSelector((state) => state.client.meetingData.host);
  const sessionToken = useSelector((state) => state.client.meetingData.sessionToken);
  const [meetingSettings] = useMeetingSettings()

  const [presentationOnlyJoinUrl, setPresentationOnlyJoinUrl] = useState('');
  const webViewRef = useRef();

  useEffect(() => {
    // don't resize screen when keyboard shows
    setAdjustPan();
    if (!joinUrl) {
      return;
    }

    const getJoinUrlWithEnforceLayout = `https://${host}/bigbluebutton/api/getJoinUrl?sessionToken=${sessionToken}&enforceLayout=PRESENTATION_ONLY`;

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

    return () => {
      // restore keyboard default behaviour
      setAdjustResize();
    };
  }, []);

  useEffect(() => {
    webViewRef?.current?.reload();
  }, [presentationOnlyJoinUrl]);

  if (presentationOnlyJoinUrl === '') {
    return;
  }

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={(ref) => { webViewRef.current = ref; }}
        source={{ uri: presentationOnlyJoinUrl }}
        userAgent="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36"
        javaScriptEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        allowsFullscreenVideo
      />
    </View>
  );
};

export default WhiteboardScreen;
