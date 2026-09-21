import {
  RoomContext,
  useLocalParticipant,
  useTracks,
} from '@livekit/react-native';
import { Track } from 'livekit-client';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import useDebounce from '../../../../hooks/use-debounce';
import { liveKitRoom } from '../../../../services/livekit';
import logger from '../../../../services/logger';
import { getMeetingSettings } from '../../../../graphql/local-states/useMeetingSettings';
import {
  setIsLocalConnecting,
  setIsLocalSharing,
  setLocalScreenshareId,
} from '../../../../store/redux/slices/wide-app/screenshare';
import { setIsPresentationOpen } from '../../../../store/redux/slices/wide-app/layout';
import ControlsStyled from '../../../screenshare/screenshare-controls/styles';
import PresenterViewStyled from '../../../screenshare/presenter-view/styles';

// The Android capturer can fail silently: @livekit/react-native-webrtc starts its
// mediaProjection foreground service with startForegroundService (asynchronous)
// and requests the projection right after, so MediaProjectionManager throws
// "Media projections require a foreground service of type
// FOREGROUND_SERVICE_TYPE_MEDIA_PROJECTION" before the service is up. The
// library swallows that error, leaving a published track that never carries a
// single frame - viewers just see black. A successful capture emits its first
// frame immediately, so no outbound traffic within the window below means the
// capture is dead and the publication has to be retried; by then the service is
// running. Drop this once the library waits for its own service.
const CAPTURE_PROBE_TIMEOUT = 4000;
const CAPTURE_PROBE_INTERVAL = 500;

const wait = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

const isCapturing = async (publication) => {
  const report = await publication?.track?.getRTCStatsReport?.();
  let capturing = false;

  report?.forEach?.((stat) => {
    if (stat.type !== 'outbound-rtp') return;
    if ((stat.framesEncoded ?? 0) > 0 || (stat.bytesSent ?? 0) > 0) capturing = true;
  });

  return capturing;
};

const waitForCapture = async (publication) => {
  const deadline = Date.now() + CAPTURE_PROBE_TIMEOUT;

  while (Date.now() < deadline) {
    // eslint-disable-next-line no-await-in-loop
    if (await isCapturing(publication)) return true;
    // eslint-disable-next-line no-await-in-loop
    await wait(CAPTURE_PROBE_INTERVAL);
  }

  return isCapturing(publication);
};

// Publishes/unpublishes the local screen as a LiveKit ScreenShare track. No
// GraphQL mutation is involved: the server-side LiveKit observer turns the
// track publication into the meeting's screenshare record (the `stream` in the
// screenshare subscription is the track SID), same as the web client.
// Must run under a RoomContext.Provider (see the containers below).
export const useLKScreenshare = ({ handleScreensharePublishError } = {}) => {
  const { localParticipant, isScreenShareEnabled } = useLocalParticipant();
  const tracks = useTracks([Track.Source.ScreenShare]);
  const dispatch = useDispatch();
  const isConnecting = useSelector((state) => state.screenshare.isLocalConnecting);

  // Mirror LiveKit's local state into Redux so components outside the room
  // context (content-area) can react to it. This also covers shares that end
  // outside the app, e.g. Android's "Stop sharing" system action or a room
  // reconnect: livekit-client unpublishes ended screenshare tracks by itself.
  useEffect(() => {
    dispatch(setIsLocalSharing(isScreenShareEnabled));
    if (!isScreenShareEnabled) dispatch(setLocalScreenshareId(null));
  }, [isScreenShareEnabled]);

  // `releaseCapturer: false` leaves the native capturer alive, which keeps the
  // media projection foreground service running - required between a failed
  // capture and its retry, see waitForCapture above.
  const unpublishScreenshare = useCallback(async ({ releaseCapturer = true } = {}) => {
    const localPublications = tracks
      .map((trackReference) => trackReference.publication)
      .filter((publication) => publication?.isLocal);
    // Includes a share still mid-publish, which is not in `tracks` yet.
    const localTracks = new Set([
      ...localPublications.map((publication) => publication?.track),
      localParticipant.getTrackPublication(Track.Source.ScreenShare)?.track,
    ].filter(Boolean));
    const handleUnpublishError = (error) => {
      logger.error({
        logCode: 'livekit_screenshare_unpublish_error',
        extraInfo: {
          errorMessage: error.message,
          errorStack: error.stack,
        },
      }, `LiveKit: screenshare unpublish error ${error.message}`);
    };

    try {
      await Promise.all(localPublications
        .map((publication) => localParticipant.unpublishTrack(publication?.track)
          .then((trackPublication) => {
            logger.info({
              logCode: 'livekit_screenshare_unpublished',
              extraInfo: { screenshareId: trackPublication?.trackSid },
            }, `LiveKit: screenshare unpublished ${trackPublication?.trackSid}`);
            return trackPublication;
          })
          .catch(handleUnpublishError)));

      // Covers a share not yet reflected in useTracks (mid-publish) and stops
      // the capturer, which also tears down the Android media projection service.
      if (localParticipant.isScreenShareEnabled) {
        await localParticipant.setScreenShareEnabled(false);
      }
    } catch (error) {
      handleUnpublishError(error);
    } finally {
      // On React Native, livekit-client's track stop only flags the JS track as
      // ended: the Android capturer - and with it the media projection service
      // and its notification - is disposed only on an explicit native release.
      if (releaseCapturer) {
        localTracks.forEach((track) => track.mediaStreamTrack?.release?.());
      }
      dispatch(setLocalScreenshareId(null));
      dispatch(setIsLocalSharing(false));
    }
  }, [localParticipant, tracks]);

  const publishScreenshare = useCallback(async () => {
    const screenshareName = `${localParticipant.identity}-screenshare-video`;
    const screenshareSettings = getMeetingSettings()
      ?.public?.media?.livekit?.screenshare?.publishOptions;
    // No audio capture: screen audio needs CAPTURE_AUDIO_OUTPUT on Android
    // and the mobile viewer has no use for it.
    const captureOptions = {
      audio: false,
      video: true,
      contentHint: 'detail',
    };
    const publishOptions = {
      dtx: true,
      videoCodec: 'vp8',
      simulcast: false,
      ...screenshareSettings,
      name: screenshareName,
    };

    try {
      if (localParticipant.isScreenShareEnabled) await unpublishScreenshare();

      dispatch(setIsLocalConnecting(true));
      // On Android this opens the system MediaProjection consent dialog and,
      // once accepted, starts the mediaProjection foreground service bundled
      // in @livekit/react-native-webrtc before capturing.
      const enableScreenShare = () => localParticipant.setScreenShareEnabled(
        true,
        captureOptions,
        publishOptions,
      );
      let localPub = await enableScreenShare();

      if (!localPub) throw new Error('Local screenshare publication failed');

      if (!await waitForCapture(localPub)) {
        logger.warn({
          logCode: 'livekit_screenshare_capture_retry',
          extraInfo: { screenshareId: localPub.trackSid },
        }, 'LiveKit: screenshare captured no frames, retrying');
        await unpublishScreenshare({ releaseCapturer: false });
        localPub = await enableScreenShare();

        if (!localPub) throw new Error('Local screenshare publication failed');
      }

      const screenshareId = localPub.trackSid ?? screenshareName;
      dispatch(setLocalScreenshareId(screenshareId));
      dispatch(setIsLocalSharing(true));
      // Make sure the content area (presenter view) is visible.
      dispatch(setIsPresentationOpen(true));
      logger.info({
        logCode: 'livekit_screenshare_published',
        extraInfo: { screenshareId },
      }, `LiveKit: screenshare published ${screenshareId}`);
    } catch (error) {
      if (handleScreensharePublishError) {
        handleScreensharePublishError(error, publishScreenshare);
      } else {
        logger.error({
          logCode: 'livekit_screenshare_publish_error',
          extraInfo: {
            errorName: error?.name,
            errorMessage: error?.message,
          },
        }, `LiveKit: screenshare publish error ${error?.message}`);
      }
    } finally {
      dispatch(setIsLocalConnecting(false));
    }
  }, [
    localParticipant,
    unpublishScreenshare,
    handleScreensharePublishError,
  ]);

  return {
    isSharing: isScreenShareEnabled,
    isConnecting,
    publishScreenshare,
    unpublishScreenshare,
  };
};

const LKScreenshareControls = ({
  disabled,
  fireDisabledScreenshareAlert,
  handleScreensharePublishError,
}) => {
  const {
    isSharing,
    isConnecting,
    publishScreenshare,
    unpublishScreenshare,
  } = useLKScreenshare({ handleScreensharePublishError });
  const isActive = isSharing || isConnecting;

  // Only the presenter may share: if the role is taken away mid-share, stop.
  useEffect(() => {
    if (disabled && isSharing) unpublishScreenshare();
  }, [disabled, isSharing]);

  const onButtonPress = useDebounce(useCallback(() => {
    if (disabled) {
      fireDisabledScreenshareAlert();
      return;
    }

    if (isActive) {
      unpublishScreenshare();
    } else {
      publishScreenshare();
    }
  }, [
    disabled,
    isActive,
    publishScreenshare,
    unpublishScreenshare,
    fireDisabledScreenshareAlert,
  ]), 1000);

  return (
    <ControlsStyled.ScreenshareButton
      isActive={isActive}
      isConnecting={isConnecting}
      disabled={disabled}
      onPress={onButtonPress}
    />
  );
};

const LKScreenshareControlsContainer = (props) => (
  <RoomContext.Provider value={liveKitRoom}>
    <LKScreenshareControls {...props} />
  </RoomContext.Provider>
);

const LKStopScreenshare = () => {
  const { t } = useTranslation();
  const { unpublishScreenshare } = useLKScreenshare();
  const onPress = useDebounce(useCallback(() => {
    unpublishScreenshare();
  }, [unpublishScreenshare]), 1000);

  return (
    <PresenterViewStyled.StopButton onPress={onPress}>
      {t('mobileSdk.screenshare.stopLabel')}
    </PresenterViewStyled.StopButton>
  );
};

// Stop control for the presenter view (content-area), outside the actions bar.
export const LKStopScreenshareControl = () => (
  <RoomContext.Provider value={liveKitRoom}>
    <LKStopScreenshare />
  </RoomContext.Provider>
);

export default LKScreenshareControlsContainer;
