import {
  forwardRef, useEffect, useImperativeHandle, useRef, useState,
} from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import Styled from './styles';

// Mirrors the Eduplay custom player from mconf-live
// (bigbluebutton-html5/.../external-video-player/custom-players/eduplay.jsx).
// The embed page is loaded inside an iframe of a small wrapper page, exactly
// like the web client does, and the wrapper relays postMessage traffic in both
// directions between the iframe and React Native.
const MATCH_URL = /https?:\/\/(hmg\.|tst\.)?(eduplay\.rnp\.br)\/(app|portal)\/(videolive|video|tv|channel|radio|podcast)\/(.*)/;

const canPlay = (url) => MATCH_URL.test(url);

const parseUrl = (url) => {
  const m = url.match(MATCH_URL);
  if (!m) return null;

  return {
    host: `https://${m[1] || ''}${m[2]}`,
    videoType: m[4],
    videoId: m[5],
  };
};

// Viewers get the `/remote-control` embed so play/pause/seek can be driven
// from the meeting state; the presenter gets the regular embed with its own
// controls (same as `eduplay.remoteControl: !showControls` on the web).
const getEmbedUrl = (url, { remoteControl }) => {
  const parsed = parseUrl(url);
  if (!parsed) return null;

  const { host, videoType, videoId } = parsed;
  return `${host}/portal/${videoType}/embed/${videoId}${remoteControl ? '/remote-control' : ''}`;
};

const EduplayPlayer = forwardRef(({
  url, playing, playerCurrentTime, isPresenter,
}, ref) => {
  const webViewRef = useRef();
  const [ready, setReady] = useState(false);
  const remoteControl = !isPresenter;
  const parsed = parseUrl(url);
  const embedUrl = getEmbedUrl(url, { remoteControl });

  const sendToPlayer = (obj) => {
    if (!remoteControl || !webViewRef.current) return;
    webViewRef.current.injectJavaScript(
      `try { sendToPlayer(${JSON.stringify(obj)}); } catch (e) {} true;`,
    );
  };

  useImperativeHandle(ref, () => ({
    seekTo: (sec) => sendToPlayer({ event: 'seek', playerPosition: sec }),
    play: () => sendToPlayer({ event: 'play' }),
    pause: () => sendToPlayer({ event: 'pause' }),
  }));

  useEffect(() => {
    if (!ready) return;

    if (playerCurrentTime != null) {
      sendToPlayer({ event: 'seek', playerPosition: playerCurrentTime });
    }
    sendToPlayer({ event: playing ? 'play' : 'pause' });
  }, [ready, playerCurrentTime, playing]);

  const handleMessage = (event) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'ready') setReady(true);
    } catch {
      // ignore non-JSON messages from the page
    }
  };

  if (!parsed || !embedUrl) return null;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="referrer" content="strict-origin-when-cross-origin">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: black; overflow: hidden; }
          iframe { width: 100%; height: 100%; border: 0; }
        </style>
      </head>
      <body>
        <iframe
          id="player"
          src="${embedUrl}"
          allow="autoplay; fullscreen; encrypted-media"
          allowfullscreen
          scrolling="no"
        ></iframe>
        <script>
          var PLAYER_ORIGIN = '${parsed.host}';

          function sendToPlayer(obj) {
            var frame = document.getElementById('player');
            if (frame && frame.contentWindow) {
              frame.contentWindow.postMessage(JSON.stringify(obj), '*');
            }
          }

          // Relay player events (onPlay/onPause/onSeek/onTime) to React Native.
          window.addEventListener('message', function (e) {
            if (e.origin !== PLAYER_ORIGIN) return;
            if (e.data && e.data.command) return;
            var payload = typeof e.data === 'string' ? e.data : JSON.stringify(e.data);
            window.ReactNativeWebView.postMessage(payload);
          }, false);

          document.getElementById('player').addEventListener('load', function () {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
          });
        </script>
      </body>
    </html>
  `;

  return (
    <Styled.Container>
      <SafeAreaView style={styles.safe}>
        <WebView
          ref={webViewRef}
          style={styles.webview}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          allowsFullscreenVideo
          mediaPlaybackRequiresUserAction={false}
          source={{ html, baseUrl: parsed.host }}
          onMessage={handleMessage}
        />
      </SafeAreaView>
    </Styled.Container>
  );
});

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});

export { canPlay, getEmbedUrl, MATCH_URL };
export default EduplayPlayer;
