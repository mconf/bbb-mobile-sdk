import {
  RoomContext,
  useLocalParticipant,
  useTracks
} from '@livekit/react-native';
import { Track } from 'livekit-client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import useDebounce from '../../../../hooks/use-debounce';
import { liveKitRoom, restartCameraTrack } from '../../../../services/livekit';
import logger from '../../../../services/logger';
import {
  setIsConnected,
  setIsConnecting,
  setLocalCameraId,
} from '../../../../store/redux/slices/wide-app/video';
import Styled from '../../../video/video-controls/styles';
import {
  cancelQueuedNotification,
  hideNotification,
  showNotificationWithTimeout,
} from '../../../../store/redux/slices/wide-app/notification-bar';
import {
  consumeExpectedStreamStop,
  expectStreamStop,
} from '../../../../services/livekit/camera-state.ts';
import { getMeetingSettings } from '../../../../graphql/local-states/useMeetingSettings';
import { getCameraCaptureResolution, getCameraPublishOptions } from '../service';

const CAMERA_STOPPED_PROFILES = ['cameraStopped', 'cameraStoppedByLock'];

const LKVideoControls = ({
  disabled,
  appState,
  isConnected,
  isConnecting,
  localCameraId,
  sendUserShareWebcam,
  sendUserStopWebcam,
  fireDisabledCamAlert,
  handleCameraPublishError,
  cameraFacingMode,
}) => {
  const { localParticipant } = useLocalParticipant();
  const tracks = useTracks([Track.Source.Camera]);
  const dispatch = useDispatch();
  const [publishOnActive, setPublishOnActive] = useState(false);
  const isMounted = useRef(false);
  const isActive = localParticipant.isCameraEnabled || isConnecting;

  const unpublishCamera = useCallback(async () => {
    const publications = tracks.map((trackReference) => trackReference.publication);
    const localPublications = publications.filter((publication) => publication?.isLocal);
    const handleUnpublishError = (error) => {
      logger.error({
        logCode: 'livekit_camera_unpublish_error',
        extraInfo: {
          errorMessage: error.message,
          errorStack: error.stack,
        },
      }, `LiveKit: camera unpublish error ${error.message}`);
    };

    try {
      await Promise.all(localPublications.map(async (publication) => {
        const cameraId = publication?.trackName;

        try {
          if (publication?.track == null) {
            logger.warn({
              logCode: 'livekit_camera_unpublish_no_track',
              extraInfo: { cameraId },
            }, `LiveKit: camera track already gone, skipping unpublish ${cameraId}`);
            return;
          }

          // Marked before the server hears about it, so the row this camera loses
          // is not read as a teardown the user did not ask for.
          if (cameraId) expectStreamStop(cameraId);

          // The room does not stop tracks on unpublish, so the camera asks for it.
          const trackPublication = await localParticipant.unpublishTrack(publication.track, true);

          if (trackPublication == null) {
            // unpublishTrack skips the stop for a publication it no longer knows.
            publication.track?.stop();
            logger.warn({
              logCode: 'livekit_camera_unpublish_no_publication',
              extraInfo: { cameraId },
            }, `LiveKit: camera publication already gone ${cameraId}`);
            return;
          }

          logger.info({
            logCode: 'livekit_camera_unpublished',
            extraInfo: { cameraId: trackPublication.trackName },
          }, `LiveKit: Camera unpublished ${trackPublication.trackName}`);
        } catch (error) {
          handleUnpublishError(error);
        } finally {
          if (cameraId) sendUserStopWebcam(cameraId);
        }
      }));
    } catch (error) {
      handleUnpublishError(error);
    } finally {
      dispatch(setLocalCameraId(null));
      dispatch(setIsConnected(false));
    }
  }, [localParticipant, sendUserStopWebcam, tracks]);

  const publishCamera = useCallback(async () => {
    const newCameraId = `${localParticipant.identity}_app_${Date.now()}`;
    const cameraSettings = getMeetingSettings()?.public?.media?.livekit?.camera?.publishOptions;
    const simulcastOptions = getCameraPublishOptions();
    const captureOptions = {
      facingMode: cameraFacingMode,
      resolution: getCameraCaptureResolution(),
    };
    const publishOptions = {
      dtx: true,
      videoCodec: 'vp8',
      ...cameraSettings,
      ...simulcastOptions,
      name: newCameraId,
    };

    try {
      if (localParticipant.isCameraEnabled) await unpublishCamera();

      dispatch(setIsConnecting(true));
      const localPub = await localParticipant.setCameraEnabled(
        true,
        captureOptions,
        publishOptions,
      );

      if (!localPub) throw new Error('Local track publication failed');

      const cameraId = localPub.trackName ?? newCameraId;
      // A camera that is back on makes any teardown notice about the previous one
      // obsolete, including one still queued.
      consumeExpectedStreamStop(cameraId);
      CAMERA_STOPPED_PROFILES.forEach((profile) => {
        cancelQueuedNotification(profile);
        dispatch(hideNotification(profile));
      });
      dispatch(setLocalCameraId(cameraId));
      dispatch(setIsConnected(true));
      sendUserShareWebcam(cameraId);
    } catch (error) {
      handleCameraPublishError(error, publishCamera);
    } finally {
      dispatch(setIsConnecting(false));
    }
  }, [
    localParticipant,
    unpublishCamera,
    sendUserShareWebcam,
    handleCameraPublishError,
    cameraFacingMode,
  ]);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    const localTrack = tracks.find((t) => t.publication?.isLocal)?.publication?.track;
    if (localTrack) {
      restartCameraTrack(localTrack, {
        facingMode: cameraFacingMode,
        resolution: getCameraCaptureResolution(),
      }).catch((error) => {
        logger.warn({
          logCode: 'livekit_camera_restart_error',
          extraInfo: { errorMessage: error?.message },
        }, `LiveKit: camera restart failed: ${error?.message}`);
      });
    }
    dispatch(showNotificationWithTimeout({ profile: 'cameraToggle' }));

  }, [cameraFacingMode])

  const onButtonPress = useDebounce(useCallback(() => {
    if (!disabled) {
      if (isActive) {
        unpublishCamera();
      } else {
        publishCamera();
      }
    } else {
      fireDisabledCamAlert();
    }
  }, [disabled, isActive, localCameraId, publishCamera, unpublishCamera]), 1000);

  useEffect(() => {
    if (appState.match(/inactive|background/) && isActive) {
      // Only schedule a re-share if the camera was connected in the first place.
      // If it's still connecting, just stop it.
      setPublishOnActive(isConnected);
      unpublishCamera();
    } else if (appState === 'active' && publishOnActive) {
      if (!disabled) {
        publishCamera();
        setPublishOnActive(false);
      } else {
        fireDisabledCamAlert();
      }
    }
  }, [appState, unpublishCamera, publishCamera]);

  return (
    <Styled.VideoButton
      isActive={isActive}
      onPress={onButtonPress}
      isConnecting={isConnecting}
    />
  );
};

const LKVideoControlsContainer = (props) => {
  return (
    <RoomContext.Provider value={liveKitRoom}>
      <LKVideoControls {...props} />
    </RoomContext.Provider>
  );
};

export default LKVideoControlsContainer;
