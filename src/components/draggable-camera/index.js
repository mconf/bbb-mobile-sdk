import { useSelector } from 'react-redux';
import useCurrentUser from '../../graphql/hooks/useCurrentUser';
import Styled from './styles';

const DraggableCamera = () => {
  const { data: currentUserData } = useCurrentUser();
  const currentUserCameraId = currentUserData?.user_current[0]?.cameras[0]?.streamId;
  const mediaStreamId = useSelector((state) => state.video.videoStreams[currentUserCameraId]);

  if (!mediaStreamId) {
    return null;
  }

  return (
    <Styled.Container>
      <Styled.VideoStream streamURL={mediaStreamId} zOrder={2} />
    </Styled.Container>
  );
};

export default DraggableCamera;
