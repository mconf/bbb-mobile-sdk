import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import IconButtonComponent from '../../icon-button';
import Colors from '../../../constants/colors';
import VideoManager from '../../../services/webrtc/video-manager';
import Styled from './styles';
import logger from '../../../services/logger';
import { selectLockSettingsProp } from '../../../store/redux/slices/meeting';
import { isLocked } from '../../../store/redux/slices/current-user';
import { selectLocalVideoStreams } from '../../../store/redux/slices/video-streams';
import { isClientReady } from '../../../store/redux/slices/wide-app/client';
import useAppState from '../../../hooks/use-app-state';

const VideoControls = (props) => {
  const { isLandscape } = props;
  const { t } = useTranslation();
  const isConnected = useSelector((state) => state.video.isConnected);
  const isConnecting = useSelector((state) => state.video.isConnecting);
  const localCameraId = useSelector((state) => state.video.localCameraId);
  const camDisabled = useSelector((state) => selectLockSettingsProp(state, 'disableCam') && isLocked(state));
  const userRequestedHangup = useSelector((state) => state.video.userRequestedHangup);
  const localVideoStreams = useSelector(selectLocalVideoStreams);
  const ready = useSelector((state) => isClientReady(state) && state.video.signalingTransportOpen);
  const isActive = isConnected || isConnecting;
  const iconColor = isActive ? Colors.white : Colors.lightGray300;
  const buttonSize = isLandscape ? 24 : 32;
  const appState = useAppState();
  const [publishOnActive, setPublishOnActive] = useState(false);

  const fireDisabledCamAlert = () => {
    // TODO localization, programmatically dismissable Dialog that is reusable
    Alert.alert(
      t('Webcam sharing blocked'),
      t('You need permission from a moderator to perform this action.'),
      null,
      { cancelable: true },
    );
  };

  const publishCamera = () => {
    VideoManager.publish().catch((error) => {
      logger.error({
        logCode: 'video_publish_failure',
        extraInfo: {
          errorCode: error.code,
          errorMessage: error.message,
        }
      }, `Video published failed: ${error.message} - ${error.name}`);

      if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
        // TODO localization
        const buttons = [
          {
            text: t('Cancel'),
            style: 'cancel'
          },
          {
            text: t('Settings'),
            onPress: () => Linking.openSettings(),
          },
          {
            text: t('Try again'),
            onPress: () => publishCamera(),
          },
        ];

        Alert.alert(
          t('Webcam sharing blocked'),
          t('We need your permission so the webcam can be shared.'),
          buttons,
          { cancelable: true },
        );
      }
      // FIXME surface the rest of the errors via toast or chain a retry.
    });
  };

  useEffect(() => {
    if (appState.match(/inactive|background/) && isActive) {
      // Only schedule a re-share if the camera was connected in the first place.
      // If it's still connecting, just stop it.
      setPublishOnActive(isConnected);
      VideoManager.unpublish(localCameraId);
    } else if (appState === 'active' && publishOnActive) {
      if (!camDisabled) {
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

      if (!camDisabled && localCameraId == null) {
        publishCamera();
      } else {
        fireDisabledCamAlert();
      }
    }
  }, [userRequestedHangup, localVideoStreams, isConnected, localCameraId, ready]);

  return (
    <View>
      <IconButtonComponent
        size={buttonSize}
        icon={isActive ? 'video' : 'video-off'}
        iconColor={iconColor}
        containerColor={isActive ? Colors.blue : Colors.lightGray100}
        animated
        onPress={() => {
          if (!camDisabled) {
            if (isActive) {
              VideoManager.unpublish(localCameraId);
            } else {
              publishCamera();
            }
          } else {
            fireDisabledCamAlert();
          }
        }}
      />
      <Styled.LoadingWrapper pointerEvents="none">
        <ActivityIndicator
          size={buttonSize * 1.5}
          color={iconColor}
          animating={isConnecting}
          hidesWhenStopped
        />
      </Styled.LoadingWrapper>
    </View>
  );
};

export default VideoControls;
