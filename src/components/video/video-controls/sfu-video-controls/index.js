import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectMetadata } from '../../../../store/redux/slices/meeting';
import { selectLocalVideoStreams } from '../../../../store/redux/slices/video-streams';
import { isClientReady } from '../../../../store/redux/slices/wide-app/client';
import useDebounce from '../../../../hooks/use-debounce';
import { useMediaManagers } from '../../../../app-instance/context';
import Styled from '../styles';

const SFUVideoControls = ({
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
  // This App instance's video manager (see src/app-instance)
  const { videoManager: VideoManager } = useMediaManagers();
  const userRequestedHangup = useSelector((state) => state.video.userRequestedHangup);
  const localVideoStreams = useSelector(selectLocalVideoStreams);
  const ready = useSelector((state) => isClientReady(state) && state.video.signalingTransportOpen);
  const mediaServer = useSelector((state) => selectMetadata(state, 'media-server-video'));
  const recordingAdapter = useSelector((state) => selectMetadata(state, 'sfu-recording-adapter'));
  const [publishOnActive, setPublishOnActive] = useState(false);

  const isActive = isConnected || isConnecting;

  const onButtonPress = useDebounce(() => {
    if (!disabled) {
      if (isActive) {
        VideoManager.unpublish(localCameraId);
      } else {
        publishCamera();
      }
    } else {
      fireDisabledCamAlert();
    }
  }, 1000);

  const publishCamera = useCallback(() => {
    VideoManager.publish({ mediaServer, recordingAdapter }).catch((error) => {
      handleCameraPublishError(error, publishCamera);
    });
  }, [mediaServer, recordingAdapter]);

  useEffect(() => {
    if (localCameraId) {
      sendUserShareWebcam(localCameraId);
    }
  }, [localCameraId]);

  useEffect(() => {
    if (userRequestedHangup && localCameraId) {
      sendUserStopWebcam(localCameraId);
    }
  }, [userRequestedHangup]);

  useEffect(() => {
    if (appState.match(/inactive|background/) && isActive) {
      // Only schedule a re-share if the camera was connected in the first place.
      // If it's still connecting, just stop it.
      setPublishOnActive(isConnected);
      VideoManager.unpublish(localCameraId);
    } else if (appState === 'active' && publishOnActive) {
      if (!disabled) {
        publishCamera();
        setPublishOnActive(false);
      } else {
        fireDisabledCamAlert();
      }
    }
  }, [appState]);

  useEffect(() => {
    // Remote camera stream is present and local stream is absent, but user
    // hasn't really requested a hangup - we need to reconnect
    if (ready
      && localVideoStreams.length >= 1
      && isActive === false
      && userRequestedHangup === false) {
      localVideoStreams.forEach(({ stream }) => {
        if (stream === localCameraId) return;
        VideoManager.stopVideo(stream);
      });

      if (!disabled && localCameraId == null) {
        publishCamera();
      } else {
        fireDisabledCamAlert();
      }
    }
  }, [userRequestedHangup, localVideoStreams, isConnected, localCameraId, ready]);

  return (
    <Styled.VideoButton
      isActive={isActive}
      onPress={onButtonPress}
      isConnecting={isConnecting}
    />
  );
};

export default SFUVideoControls;
