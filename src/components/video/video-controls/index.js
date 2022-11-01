import { useSelector } from 'react-redux';
import IconButtonComponent from '../../icon-button';
import Colors from '../../../constants/colors';
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
      icon={isActive ? 'video' : 'video-off'}
      iconColor={isActive ? Colors.white : Colors.lightGray300}
      containerColor={isActive ? Colors.blue : Colors.lightGray100}
      animated
      loading={isConnecting}
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
