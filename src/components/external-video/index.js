import { useSubscription } from '@apollo/client';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import useCurrentUser from '../../graphql/hooks/useCurrentUser';
import logger from '../../services/logger';
import WebViewPlayer from './players/webview';
import YouTubePlayer from './players/youtube';
import EduplayPlayer, { canPlay as canPlayEduplay } from './players/eduplay';
import { EXTERNAL_VIDEO_SUBSCRIPTION } from './queries';
import Styled from './styles';

const YOUTUBE_REGEX = /youtube\.com|youtu\.be/;

const getPlayerType = (url) => {
  if (!url) return 'unknown';
  if (YOUTUBE_REGEX.test(url)) return 'youtube';
  if (canPlayEduplay(url)) return 'eduplay';
  // if (/vimeo\.com/.test(url)) return 'vimeo';
  // if (/twitch\.tv/.test(url)) return 'twitch';
  // if (/dailymotion\.com/.test(url)) return 'dailymotion';
  // if (url.endsWith('.mp4') || url.endsWith('.m3u8')) return 'mp4';
  return 'unknown';
};

// Same formula as mconf-live's `calculateCurrentTime`: while paused the
// position is exactly what the presenter last reported; while playing it is
// that position plus the wall-clock time elapsed since the last update.
const calculateCurrentTime = (externalVideo) => {
  const playerCurrentTime = externalVideo?.playerCurrentTime ?? 0;
  const updatedAt = new Date(externalVideo?.updatedAt ?? Date.now()).getTime();
  const isPaused = !externalVideo?.playerPlaying;

  if (isPaused) return playerCurrentTime;

  return playerCurrentTime + (Date.now() - updatedAt) / 1000;
};

const ExternalVideo = forwardRef(({ url }, ref) => {
  const playerRef = useRef();
  const { t } = useTranslation();
  const { data: currentUserData } = useCurrentUser();

  const { data: externalVideoData } = useSubscription(EXTERNAL_VIDEO_SUBSCRIPTION, {
    onError: (error) => {
      logger.error({
        logCode: 'external_video_subscription_error',
        extraInfo: { errorMessage: error?.message },
      }, 'External video subscription failed');
    },
  });

  const externalVideo = externalVideoData?.meeting?.[0]?.externalVideo;
  const playing = externalVideo?.playerPlaying ?? false;
  const effectivePlayerCurrentTime = calculateCurrentTime(externalVideo);
  const isPresenter = currentUserData?.isPresenter || false;
  const type = getPlayerType(url);

  useImperativeHandle(ref, () => ({
    seekTo: (sec) => playerRef.current?.seekTo?.(sec),
    play: () => playerRef.current?.play?.(),
    pause: () => playerRef.current?.pause?.(),
  }));

  if (type === 'youtube') {
    return (
      <YouTubePlayer
        ref={playerRef}
        url={url}
        playing={playing}
        playerCurrentTime={effectivePlayerCurrentTime}
        isPresenter={isPresenter}
      />
    );
  }

  if (type === 'eduplay') {
    return (
      <EduplayPlayer
        ref={playerRef}
        url={url}
        playing={playing}
        playerCurrentTime={effectivePlayerCurrentTime}
        isPresenter={isPresenter}
      />
    );
  }

  if (type === 'unknown') {
    return (
      <Styled.Container>
        <Styled.Card>
          <Styled.Text>{t('app.externalVideo.unsupported')}</Styled.Text>
        </Styled.Card>
      </Styled.Container>
    );
  }

  const embedUrl = (() => {
    if (type === 'vimeo') return url.replace('vimeo.com', 'player.vimeo.com/video');
    if (type === 'dailymotion') return url.replace('dailymotion.com/video', 'dailymotion.com/embed/video');
    if (type === 'twitch') return `https://player.twitch.tv/?channel=${url.split('/').pop()}&parent=localhost`;
    return url;
  })();

  return (
    <WebViewPlayer
      ref={playerRef}
      url={embedUrl}
    />
  );
});

export default ExternalVideo;
