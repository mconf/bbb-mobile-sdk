import {
  forwardRef, useRef, useEffect, useImperativeHandle, useState,
} from 'react';
import {
  SafeAreaView, StyleSheet, Dimensions, Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSelector } from 'react-redux';
import Slider from '@react-native-community/slider';
import { MaterialIcons } from '@expo/vector-icons';
import Styled from './styles';
import Colors from '../../../constants/colors';
import logger from '../../../services/logger';

const { width } = Dimensions.get('window');

// YouTube's embedded player refuses to load (error 153, "Video player
// configuration error") when the embedding page has no https origin/Referer.
// Inline HTML in a WebView has a null origin, so the page must be given a
// `baseUrl`. We use the meeting host, mirroring what the web client sends.
const FALLBACK_EMBED_ORIGIN = 'https://www.youtube.com';
// Same host the web client (mconf-live) uses for its YouTube embeds.
const YOUTUBE_EMBED_HOST = 'https://www.youtube-nocookie.com';

// TODO: make the overlay into a component
// that controls volume/restart/fullscreen independent of player type
const YoutubePlayer = forwardRef(({
  url, playing, playerCurrentTime, isPresenter,
}, ref) => {
  const webViewRef = useRef();
  const [ready, setReady] = useState(false);
  const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
  const [showVolume, setShowVolume] = useState(false);
  const [volume, setVolume] = useState(0);
  const [muted, setMuted] = useState(true);
  const volumeInitialized = useRef(false);
  const host = useSelector((state) => state.client.meetingData.host);
  const embedOrigin = host ? `https://${host}` : FALLBACK_EMBED_ORIGIN;

  const [webViewKey, setWebViewKey] = useState(0);

  const handleRefreshPlayer = () => {
    setWebViewKey((prev) => prev + 1);
    setReady(false);
    volumeInitialized.current = false;
  };

  useEffect(() => {
    if (!ready || !webViewRef.current) return;

    const commands = [];

    if (playerCurrentTime != null) {
      commands.push(`player.seekTo(${playerCurrentTime}, true);`);
    }

    if (playing) {
      commands.push('player.playVideo();');
    } else {
      commands.push('player.pauseVideo();');
    }

    const script = commands
      .map((cmd) => `try { ${cmd} } catch(e) {}`)
      .join('\n');

    webViewRef.current.injectJavaScript(`
    setTimeout(() => {
      ${script}
    }, 100);
  `);
  }, [ready, playerCurrentTime, playing]);

  useEffect(() => {
    if (!ready || !webViewRef.current) return;
    webViewRef.current.injectJavaScript(`document.dispatchEvent(new MessageEvent('message', { data: JSON.stringify({ type: 'volume', volume: ${volume} }) }));`);
  }, [volume, ready]);

  useEffect(() => {
    if (!ready || volumeInitialized.current) return undefined;

    const timeout = setTimeout(() => {
      setVolume(50);
      setMuted(false);
      volumeInitialized.current = true;
    }, 2000);

    return () => clearTimeout(timeout);
  }, [ready, volume]);

  useImperativeHandle(ref, () => ({
    seekTo: (sec) => webViewRef.current?.injectJavaScript(
      `try { player.seekTo(${sec}, true); } catch (e) {} true;`,
    ),
    play: () => webViewRef.current?.injectJavaScript('try { player.playVideo(); } catch (e) {} true;'),
    pause: () => webViewRef.current?.injectJavaScript('try { player.pauseVideo(); } catch (e) {} true;'),
  }));

  const toggleMuteIOS = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    webViewRef.current?.injectJavaScript(`
      document.dispatchEvent(new MessageEvent('message', {
        data: JSON.stringify({ type: '${newMuted ? 'mute' : 'unmute'}' })
      }));
    `);
  };

  const handleMessage = (event) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'ready') setReady(true);
      if (msg.type === 'error') {
        logger.warn({
          logCode: 'external_video_youtube_player_error',
          extraInfo: { errorCode: msg.code, videoId },
        }, `YouTube player error ${msg.code}`);
      }
    } catch {
      // ignore non-JSON messages from the page
    }
  };

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="referrer" content="strict-origin-when-cross-origin">
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body style="margin:0;margin-top:102px;padding:0;background-color:black;">
        <div id="player"></div>
        <script>
          var tag = document.createElement('script');
          tag.src = "https://www.youtube.com/iframe_api";
          var firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

          var player;
          function onYouTubeIframeAPIReady() {
            player = new YT.Player('player', {
              host: '${YOUTUBE_EMBED_HOST}',
              height: '${width}',
              width: '100%',
              videoId: '${videoId}',
              playerVars: {
                'autoplay': 0,
                'controls': 0,
                'playsinline': 1,
                'modestbranding': 1,
                'rel': 0,
                'mute': 1,
                'origin': '${embedOrigin}',
              },
              events: {
                'onReady': onPlayerReady,
                'onError': onPlayerError
              }
            });
          }

          function onPlayerReady(event) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
          }

          function onPlayerError(event) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', code: event.data }));
          }

          document.addEventListener('message', function(e) {
            var data = JSON.parse(e.data);
            if (player) {
              if (data.type === 'play') player.playVideo();
              if (data.type === 'pause') player.pauseVideo();
              if (data.type === 'seek') player.seekTo(data.time, true);
              if (data.type === 'volume') {
                player.setVolume(data.volume);
                if (data.volume > 0) player.unMute();
              }
              if (data.type === 'unmute') {
                player.unMute();
              }
              if (data.type === 'mute') {
                player.mute();
              }
            }
          });
        </script>
      </body>
    </html>
  `;

  return (
    <Styled.Container>
      <SafeAreaView style={styles.safe}>
        <WebView
          key={webViewKey}
          ref={webViewRef}
          style={styles.webview}
          javaScriptEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          source={{ html, baseUrl: embedOrigin }}
          onMessage={handleMessage}
        />
        {!isPresenter && (
          <>
            <Styled.Overlay
              pointerEvents="auto"
              onTouchStart={() => setShowVolume((v) => !v)}
              onClick={() => setShowVolume((v) => !v)}
            />

            <Styled.RestartIcon
              onPress={handleRefreshPlayer}
            />

            {Platform.OS === 'ios' ? (
              <Styled.MuteButton onPress={toggleMuteIOS}>
                <MaterialIcons
                  name={muted ? 'volume-off' : 'volume-up'}
                  size={24}
                  color={Colors.white}
                />
              </Styled.MuteButton>
            ) : (
              showVolume && (
                <Styled.VolumeContainer>
                  <Slider
                    style={{ width: 150, height: 40 }}
                    minimumValue={0}
                    maximumValue={100}
                    value={volume}
                    step={10}
                    thumbTintColor={Colors.lightBlue}
                    minimumTrackTintColor={Colors.lightBlue}
                    maximumTrackTintColor={Colors.lightGray100}
                    onValueChange={setVolume}
                  />
                </Styled.VolumeContainer>
              )
            )}

          </>
        )}
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

export default YoutubePlayer;
