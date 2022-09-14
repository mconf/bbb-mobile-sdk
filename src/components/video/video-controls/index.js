import { useSelector } from 'react-redux';
import Colors from '../../../constants/colors';
import IconButtonComponent from '../../icon-button';
import VideoManager from '../../../services/webrtc/video-manager';

const VideoControls = (props) => {
  const { isLandscape } = props;
  const isConnected = useSelector((state) => state.video.isConnected);
  const localCameraId = useSelector((state) => state.video.localCameraId);

  return (
    <IconButtonComponent
      size={isLandscape ? 24 : 32}
      icon={isConnected ? 'video' : 'video-off'}
      iconColor={isConnected ? Colors.white : Colors.lightGray300}
      containerColor={isConnected ? Colors.blue : Colors.lightGray100}
      animated
      onPress={() => {
        if (isConnected) {
          VideoManager.unpublish(localCameraId);
        } else {
          VideoManager.publish();
        }
      }}
    />
  );
};

export default VideoControls;
