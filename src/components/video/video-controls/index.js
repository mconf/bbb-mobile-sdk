import { useSelector } from 'react-redux';
import Colors from '../../../constants/colors';
import IconButtonComponent from '../../icon-button';
import VideoManager from '../../../services/webrtc/video-manager';

const VideoControls = (props) => {
  const { isLandscape } = props;
  const isConnected = useSelector((state) => state.video.isConnected);
  const isConnecting = useSelector((state) => state.video.isConnecting);
  const localCameraId = useSelector((state) => state.video.localCameraId);
  const isActive = isConnected || isConnecting;

  return (
    <IconButtonComponent
      size={isLandscape ? 24 : 32}
      icon={isConnected ? 'video' : 'video-off'}
      iconColor={isConnected ? Colors.white : Colors.lightGray300}
      containerColor={isConnected ? Colors.blue : Colors.lightGray100}
      animated
      onPress={() => {
        if (isActive) {
          VideoManager.unpublish(localCameraId);
        } else {
          VideoManager.publish();
        }
      }}
    />
  );
};

export default VideoControls;
