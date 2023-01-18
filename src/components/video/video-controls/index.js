import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Alert, AppState, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import IconButtonComponent from '../../icon-button';
import Colors from '../../../constants/colors';
import VideoManager from '../../../services/webrtc/video-manager';
import Styled from './styles';
import logger from '../../../services/logger';
import { selectLockSettingsProp } from '../../../store/redux/slices/meeting';
import { isLocked } from '../../../store/redux/slices/current-user';

const VideoControls = (props) => {
  const { isLandscape } = props;
  const isConnected = useSelector((state) => state.video.isConnected);
  const isConnecting = useSelector((state) => state.video.isConnecting);
  const localCameraId = useSelector((state) => state.video.localCameraId);
  const camDisabled = useSelector((state) => selectLockSettingsProp(state, 'disableCam') && isLocked(state));
  const isActive = isConnected || isConnecting;
  const iconColor = isActive ? Colors.white : Colors.lightGray300;
  const buttonSize = isLandscape ? 24 : 32;
  const [appState, setAppState] = useState(AppState.currentState);
  const [publishOnActive, setPublishOnActive] = useState(false);

  useEffect(() => {
    const appStateListener = AppState.addEventListener(
      'change',
      (nextAppState) => {
        setAppState(nextAppState);
      },
    );
    return () => {
      appStateListener?.remove();
    };
  }, []);

  useEffect(() => {
    if (appState.match(/inactive|background/) && isActive) {
      // Only schedule a re-share if the camera was connected in the first place.
      // If it's still connecting, just stop it.
      setPublishOnActive(isConnected);
      VideoManager.unpublish(localCameraId);
    } else if (appState === 'active' && publishOnActive) {
      if (camDisabled) {
        // TODO localization, programmatically dismissable Dialog that is
        // reusable
        Alert.alert(
          'Compartilhamento de webcam bloqueado',
          'Você precisa da permissão de um moderador para realizar esta ação',
          null,
          { cancelable: true },
        );
        return;
      }
      publishCamera();
      setPublishOnActive(false);
    }
  }, [appState]);

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
            text: 'Cancelar',
            style: 'cancel'
          },
          {
            text: 'Configurações',
            onPress: () => Linking.openSettings(),
          },
          {
            text: 'Tentar novamente',
            onPress: () => publishCamera(),
          },
        ];

        Alert.alert(
          'Permissão de webcam negada',
          'Precisamos de sua permissão para que sua câmera possa ser compartilhada',
          buttons,
          { cancelable: true },
        );
      }
      // FIXME surface the rest of the errors via toast or chain a retry.
    });
  };

  return (
    <View>
      <IconButtonComponent
        size={buttonSize}
        icon={isActive ? 'video' : 'video-off'}
        iconColor={iconColor}
        containerColor={isActive ? Colors.blue : Colors.lightGray100}
        animated
        onPress={() => {
          if (camDisabled) {
            // TODO localization, programmatically dismissable Dialog that is
            // reusable
            Alert.alert(
              'Compartilhamento de webcam bloqueado',
              'Você precisa da permissão de um moderador para realizar esta ação',
              null,
              { cancelable: true },
            );
            return;
          }

          if (isActive) {
            VideoManager.unpublish(localCameraId);
          } else {
            publishCamera();
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
