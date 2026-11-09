import {
  useTracks,
  isTrackReference,
  RoomContext,
} from '@livekit/react-native';
import { Track } from 'livekit-client';
import Styled from './styles';
import { useLiveKitRoom } from '../../../app-instance/context';

const LiveKitCameraView = ({
  trackName,
  isGrid,
  renderPlaceholder,
}) => {
  const tracks = useTracks([Track.Source.Camera]);
  const cameraTrack = tracks.find(
    (track) => track?.publication?.trackName === trackName
  );

  if (isTrackReference(cameraTrack)) {
    return (<Styled.LKCameraStream trackRef={cameraTrack} isGrid={isGrid} />);
  }

  return renderPlaceholder();
};

const LiveKitCameraViewContainer = ({
  cameraId,
  isGrid,
  renderPlaceholder,
}) => {
  const liveKitRoom = useLiveKitRoom();

  return (
    <RoomContext.Provider value={liveKitRoom}>
      <LiveKitCameraView
        trackName={cameraId}
        isGrid={isGrid}
        renderPlaceholder={renderPlaceholder}
      />
    </RoomContext.Provider>
  );
};

export default LiveKitCameraViewContainer;
