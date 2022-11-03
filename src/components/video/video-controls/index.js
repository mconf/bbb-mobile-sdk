import { useSelector } from 'react-redux';
import { ActivityIndicator, View } from 'react-native';
import IconButtonComponent from '../../icon-button';
import Colors from '../../../constants/colors';
import VideoManager from '../../../services/webrtc/video-manager';
import Styled from './styles';
import logger from '../../../services/logger'

const VideoControls = (props) => {
  const { isLandscape } = props;
  const isConnected = useSelector((state) => state.video.isConnected);
  const isConnecting = useSelector((state) => state.video.isConnecting);
  const localCameraId = useSelector((state) => state.video.localCameraId);
  const isActive = isConnected || isConnecting;
  const iconColor = isActive ? Colors.white : Colors.lightGray300;
  const buttonSize = isLandscape ? 24 : 32;

  return (
    <View>
      <IconButtonComponent
        size={buttonSize}
        icon={isActive ? 'video' : 'video-off'}
        iconColor={iconColor}
        containerColor={isActive ? Colors.blue : Colors.lightGray100}
        animated
        onPress={() => {
          if (isActive) {
            VideoManager.unpublish(localCameraId);
          } else {
            VideoManager.publish().catch((error) => {
              // TODO surface error via toast or chain a retry.
              logger.error({
                logCode: 'video_publish_failure',
                extraInfo: {
                  errorCode: error.code,
                  errorMessage: error.message,
                }
              }, `Video published failed: ${error.message}`);
            });
          }
        }}
      />
      <Styled.LoadingWrapper pointerEvents="none">
        <ActivityIndicator
          size={buttonSize * 2}
          color={iconColor}
          animating={isConnecting}
          hidesWhenStopped
        />
      </Styled.LoadingWrapper>
    </View>
  );
};

export default VideoControls;
