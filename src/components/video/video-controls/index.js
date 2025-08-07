import * as Linking from 'expo-linking';
import { Alert } from 'react-native';
import { useMutation } from '@apollo/client';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import useCurrentUser from '../../../graphql/hooks/useCurrentUser';
import useMeeting from '../../../graphql/hooks/useMeeting';
import useAppState from '../../../hooks/use-app-state';
import logger from '../../../services/logger';
import Queries from './queries';
import LKVideoControls from '../../livekit/camera/controls';
import SFUVideoControls from './sfu-video-controls';

const VideoControlsContainer = () => {
  const { data: meetingData, loading: meetingLoading } = useMeeting();
  const { data: currentUserData } = useCurrentUser();
  const { t } = useTranslation();
  const [cameraBroadcastStart] = useMutation(Queries.CAMERA_BROADCAST_START);
  const [cameraBroadcastStop] = useMutation(Queries.CAMERA_BROADCAST_STOP);
  const isConnected = useSelector((state) => state.video.isConnected);
  const isConnecting = useSelector((state) => state.video.isConnecting);
  const localCameraId = useSelector((state) => state.video.localCameraId);
  const appState = useAppState();

  const meeting = meetingData?.meeting[0];
  const meetingCamLocked = meeting?.lockSettings?.disableCam;
  const currentUserLocked = currentUserData?.user_current[0]?.locked ?? false;
  const disabled = meetingCamLocked && currentUserLocked;
  const { cameraBridge } = meeting || {};
  const buttonEnabled = cameraBridge != null && !meetingLoading;

  const sendUserShareWebcam = (cameraId) => {
    return cameraBroadcastStart({ variables: { cameraId } });
  };

  const sendUserStopWebcam = (cameraId) => {
    return cameraBroadcastStop({ variables: { cameraId } });
  };

  const fireDisabledCamAlert = () => {
    Alert.alert(
      t('mobileSdk.webcam.blockedLabel'),
      t('mobileSdk.permission.moderator'),
      null,
      { cancelable: true },
    );
  };

  const handleCameraPublishError = (error, publishCamera) => {
    logger.error({
      logCode: 'video_publish_failure',
      extraInfo: {
        errorCode: error.code,
        errorMessage: error.message,
      }
    }, `Video published failed: ${error.message} - ${error.name}`);

    if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
      const buttons = [
        {
          text: t('app.settings.main.cancel.label'),
          style: 'cancel'
        },
        {
          text: t('app.settings.main.label'),
          onPress: () => Linking.openSettings(),
        },
        {
          text: t('mobileSdk.error.tryAgain'),
          onPress: publishCamera,
        },
      ];

      Alert.alert(
        t('mobileSdk.webcam.blockedLabel'),
        t('mobileSdk.webcam.permissionLabel'),
        buttons,
        { cancelable: true },
      );
    }
  };

  // FIXME
  if (!buttonEnabled) {
    return null;
  }

  switch (cameraBridge) {
    case 'livekit':
      return (
        <LKVideoControls
          disabled={disabled}
          appState={appState}
          isConnected={isConnected}
          isConnecting={isConnecting}
          localCameraId={localCameraId}
          sendUserShareWebcam={sendUserShareWebcam}
          sendUserStopWebcam={sendUserStopWebcam}
          fireDisabledCamAlert={fireDisabledCamAlert}
          handleCameraPublishError={handleCameraPublishError}
        />
      );

    case 'bbb-webrtc-sfu':
    default:
      return (
        <SFUVideoControls
          disabled={disabled}
          appState={appState}
          isConnected={isConnected}
          isConnecting={isConnecting}
          localCameraId={localCameraId}
          sendUserShareWebcam={sendUserShareWebcam}
          sendUserStopWebcam={sendUserStopWebcam}
          fireDisabledCamAlert={fireDisabledCamAlert}
          handleCameraPublishError={handleCameraPublishError}
        />
      );
  }
};

export default VideoControlsContainer;
