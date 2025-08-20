import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  useTracks,
  useParticipantTracks,
  useLocalParticipant,
  RoomContext
} from '@livekit/react-native';
import { Track } from 'livekit-client';
import Styled from '../../../video/video-controls/styles';
import {
  setIsConnecting,
  setIsConnected,
  setLocalCameraId,
} from '../../../../store/redux/slices/wide-app/video';
import useDebounce from '../../../../hooks/use-debounce';
import logger from '../../../../services/logger';
import { liveKitRoom } from '../../../../services/livekit';

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
}) => {
  const { localParticipant } = useLocalParticipant();
  const tracks = useTracks([Track.Source.Camera]);
  const dispatch = useDispatch();
  const [publishOnActive, setPublishOnActive] = useState(false);
  const isActive = localParticipant.isCameraEnabled || isConnecting;
  const constraints = { video: true };

  const publishCamera = useCallback(async () => {
    const newCameraId = `${localParticipant.identity}_app_${Date.now()}`;
    const publishOptions = { dtx: true, videoCodec: 'vp8', name: newCameraId };

    try {
      if (localParticipant.isCameraEnabled) await unpublishCamera();

      dispatch(setIsConnecting(true));
      const localPub = await localParticipant.setCameraEnabled(true, constraints, publishOptions);

      if (!localPub) throw new Error('Local track publication failed');

      dispatch(setLocalCameraId(newCameraId));
      dispatch(setIsConnected(true));
      sendUserShareWebcam(newCameraId);
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
  ]);

  const unpublishCamera = useCallback(async () => {
    const publications = tracks.map((trackReference) => trackReference.publication);
    const localPublications = publications.filter(publication => publication?.isLocal)
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
      await Promise.all(localPublications
        .map((publication) => localParticipant.unpublishTrack(publication?.track)
          .then((trackPublication) => {
            logger.info({
              logCode: 'livekit_camera_unpublished',
              extraInfo: { cameraId: trackPublication.trackName },
            }, `LiveKit: Camera unpublished ${trackPublication.trackName}`);
            return trackPublication;
          })
          .catch(handleUnpublishError)
          .finally(() => {
            if (publication && publication.trackName) sendUserStopWebcam(publication.trackName);
          })));
    } catch (error) {
      handleUnpublishError(error);
    } finally {
      dispatch(setLocalCameraId(null));
      dispatch(setIsConnected(false));
    }
  }, [localParticipant, sendUserStopWebcam, tracks]);

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
