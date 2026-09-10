import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { setAdjustPan, setAdjustResize } from 'rn-android-keyboard-adjust';
import logger from '../../services/logger';

const WhiteboardScreen = () => {
  const joinUrl = useSelector((state) => state.client.meetingData.joinUrl);
  const host = useSelector((state) => state.client.meetingData.host);
  const directHost = useSelector((state) => state.client.meetingData.directHost);
  const sessionToken = useSelector((state) => state.client.meetingData.sessionToken);

  const [presentationOnlyJoinUrl, setPresentationOnlyJoinUrl] = useState('');

  useEffect(() => {
    // don't resize screen when keyboard shows
    setAdjustPan();
    if (!joinUrl) {
      return undefined;
    }

    // getJoinUrl is session-bound: bbb-web only honours it when the request
    // carries the JSESSIONID cookie set by the original join. That cookie
    // belongs to the API host (directHost), which on cluster-proxy setups is
    // not the html5 client host stored in `host`.
    const apiHost = directHost || host;
    const getJoinUrlWithEnforceLayout = `https://${apiHost}/bigbluebutton/api/getJoinUrl?sessionToken=${sessionToken}&enforceLayout=PRESENTATION_ONLY`;

    axios.get(getJoinUrlWithEnforceLayout).then((response) => {
      const apiResponse = response?.data?.response;
      if (apiResponse?.returncode === 'SUCCESS' && apiResponse.url) {
        setPresentationOnlyJoinUrl(apiResponse.url);
        return;
      }

      logger.warn({
        logCode: 'app_whiteboard_get_enforce_layout_joinUrl_failed',
        extraInfo: {
          returncode: apiResponse?.returncode,
          message: apiResponse?.message,
          apiHost,
        },
      }, `getJoinUrl rejected: ${apiResponse?.message || 'unexpected response'}`);
    }).catch((e) => {
      logger.warn({
        logCode: 'app_whiteboard_get_enforce_layout_joinUrl_error',
        extraInfo: {
          errorName: e.name,
          errorMessage: e.message,
          apiHost,
        },
      }, `Unable to get enforceLayout Join URL: ${e.message}`);
    });

    return () => {
      // restore keyboard default behaviour
      setAdjustResize();
    };
  }, []);

  if (presentationOnlyJoinUrl === '') {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <WebView
        // The WebView itself must follow the join redirect so the new session
        // token is registered against its own cookie jar.
        source={{ uri: presentationOnlyJoinUrl }}
        userAgent="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36"
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        allowsFullscreenVideo
        onError={({ nativeEvent }) => {
          logger.warn({
            logCode: 'app_whiteboard_webview_error',
            extraInfo: {
              code: nativeEvent?.code,
              description: nativeEvent?.description,
              url: nativeEvent?.url,
            },
          }, `Whiteboard WebView error: ${nativeEvent?.description}`);
        }}
        onHttpError={({ nativeEvent }) => {
          logger.warn({
            logCode: 'app_whiteboard_webview_http_error',
            extraInfo: {
              statusCode: nativeEvent?.statusCode,
              url: nativeEvent?.url,
            },
          }, `Whiteboard WebView HTTP error ${nativeEvent?.statusCode}`);
        }}
        onRenderProcessGone={() => {
          logger.error({
            logCode: 'app_whiteboard_webview_render_process_gone',
          }, 'The whiteboard WebView render process was killed');
        }}
      />
    </View>
  );
};

export default WhiteboardScreen;
