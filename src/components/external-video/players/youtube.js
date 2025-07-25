import { forwardRef, useRef, useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Dimensions } from 'react-native';
import Styled from './styles';
import Colors from '../../../constants/colors';
import Slider from '@react-native-community/slider';
import { Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// TODO: make the overlay into a component
// that controls volume/restart/fullscreen independent of player type
const YoutubePlayer = forwardRef(({ url, playing, playerCurrentTime, isPresenter }, ref) => {
  const webViewRef = useRef();
  const [ready, setReady] = useState(false);
  const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
  const [showVolume, setShowVolume] = useState(false);
  const [volume, setVolume] = useState(0);
  const [muted, setMuted] = useState(true);
  const volumeInitialized = useRef(false);

  const [webViewKey, setWebViewKey] = useState(0);

  const handleRefreshPlayer = () => {
    setWebViewKey(prev => prev + 1);
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
      .map(cmd => `try { ${cmd} } catch(e) {}`)
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
    if (!ready || volumeInitialized.current) return;

    const timeout = setTimeout(() => {
      setVolume(50);
      setMuted(false);
      volumeInitialized.current = true;
    }, 2000);

    return () => clearTimeout(timeout);
  }, [ready, volume]);

  const toggleMuteIOS = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    webViewRef.current?.injectJavaScript(`
      document.dispatchEvent(new MessageEvent('message', {
        data: JSON.stringify({ type: '${newMuted ? 'mute' : 'unmute'}' })
      }));
    `);
  };

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
          source={{
            html: `
              <!DOCTYPE html>
              <html>
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
                        },
                        events: {
                          'onReady': onPlayerReady
                        }
                      });
                    }

                    function onPlayerReady(event) {
                      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
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
            `
          }}
          onMessage={event => {
            try {
              const msg = JSON.parse(event.nativeEvent.data);
              if (msg.type === 'ready') setReady(true);
            } catch { }
          }}
        />
        {!isPresenter && (
          <>
            <Styled.Overlay
              pointerEvents="auto"
              onTouchStart={() => setShowVolume(v => !v)}
              onClick={() => setShowVolume(v => !v)}
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
    </Styled.Container >
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
