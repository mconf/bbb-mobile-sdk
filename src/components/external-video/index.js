import { useSubscription } from '@apollo/client';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import useCurrentUser from '../../graphql/hooks/useCurrentUser';
import WebViewPlayer from './players/webview';
import YouTubePlayer from './players/youtube';
import { EXTERNAL_VIDEO_SUBSCRIPTION } from './queries';
import Styled from './styles';

const ExternalVideo = forwardRef(({ url }, ref) => {
  const playerRef = useRef();
  const { t } = useTranslation();
  const { data: currentUserData } = useCurrentUser();

  const {
    data: externalVideoData,
    loading: externalVideoLoading,
    error: externalVideoError,
  } = useSubscription(EXTERNAL_VIDEO_SUBSCRIPTION);

  useEffect(() => {
    if (!externalVideoLoading && externalVideoError) {
      console.error("externalVideoError: ", externalVideoError);
    }
  }, [externalVideoData, externalVideoLoading, externalVideoError]);

  const playing = externalVideoData?.meeting[0]?.externalVideo?.playerPlaying;
  const playerCurrentTime = externalVideoData?.meeting[0]?.externalVideo?.playerCurrentTime;

  const type = (() => {
    if (/youtube\.com|youtu\.be/.test(url)) return 'youtube';
    // if (/vimeo\.com/.test(url)) return 'vimeo';
    // if (/twitch\.tv/.test(url)) return 'twitch';
    // if (/dailymotion\.com/.test(url)) return 'dailymotion';
    // if (url.endsWith('.mp4') || url.endsWith('.m3u8')) return 'mp4';
    return 'unknown';
  })();

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
        playerCurrentTime={playerCurrentTime}
        isPresenter={currentUserData?.isPresenter || false}
      />
    );
  };

  if (type === 'unknown') {
    return (
      <Styled.Container>
        <Styled.Card>
          <Styled.Text>{t("app.externalVideo.unsupported")}</Styled.Text>
        </Styled.Card>
      </Styled.Container>
    );
  };

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
