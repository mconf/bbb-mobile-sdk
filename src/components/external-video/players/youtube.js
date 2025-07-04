import { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Dimensions } from 'react-native';
import Styled from './styles';
import Colors from '../../../constants/colors';
import Slider from '@react-native-community/slider';

const { width } = Dimensions.get('window');
const PLAYER_HEIGHT = width;

const YouTubePlayer = forwardRef(({ url, playing, playerCurrentTime, isPresenter }, ref) => {
  const youtubeRef = useRef();
  const [showVolume, setShowVolume] = useState(false);
  const [volume, setVolume] = useState(50);
  const [pendingSeek, setPendingSeek] = useState(null);
  const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();

  useImperativeHandle(ref, () => ({
    seekTo: (sec) => youtubeRef.current?.seekTo(sec, true),
    play: () => youtubeRef.current?.play(),
    pause: () => youtubeRef.current?.pause(),
  }));

  useEffect(() => {
    if (
      typeof playerCurrentTime === 'number' &&
      youtubeRef.current
    ) {
      setPendingSeek(playerCurrentTime);
      youtubeRef.current.seekTo(playerCurrentTime, true);
    }
  }, [playerCurrentTime]);

  return (
    <Styled.Container>
      <YoutubePlayer
        ref={youtubeRef}
        height={PLAYER_HEIGHT}
        videoId={videoId}
        play={playing}
        volume={volume}
        onChangeState={async (state) => {
          if (state === 'playing' && pendingSeek !== null && youtubeRef.current) {
            const currentTime = await youtubeRef.current.getCurrentTime();
            if (Math.abs(currentTime - pendingSeek) > 2) {
              youtubeRef.current.seekTo(pendingSeek, true);
            } else {
              setPendingSeek(null);
            }
          }
        }}
        initialPlayerParams={{
          controls: 0,
          rel: 0,
          modestbranding: 1,
          disablekb: 1,
        }}
      />
      {!isPresenter && (
        <>
          <Styled.Overlay
            pointerEvents="auto"
            onTouchStart={() => setShowVolume(v => !v)}
            onClick={() => setShowVolume(v => !v)}
          />
          {showVolume && (
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
          )}
        </>
      )}
    </Styled.Container>
  );
});


export default YouTubePlayer;
