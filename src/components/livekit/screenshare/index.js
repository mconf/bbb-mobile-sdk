import {
  useTracks,
  isTrackReference,
  RoomContext,
} from '@livekit/react-native';
import { Track } from 'livekit-client';
import { useSubscription } from '@apollo/client';
import Styled from './styles';
import { useLiveKitRoom } from '../../../app-instance/context';
import screenshareSubscription from '../../../graphql/queries/screenshareSubscription';

const LiveKitScreenshareView = ({ trackId }) => {
  const tracks = useTracks([Track.Source.ScreenShare]);
  const screenshareTrack = tracks.find(
    (track) => track?.publication?.trackSid === trackId
  ) || tracks[0];

  if (isTrackReference(screenshareTrack)) {
    return (<Styled.LKScreenshareStream trackRef={screenshareTrack} />);
  }

  return <Styled.LKScreenshareSkeleton />;
};

const LiveKitScreenshareViewContainer = () => {
  const { data: screenshareData } = useSubscription(screenshareSubscription);
  const trackId = screenshareData?.screenshare[0]?.stream;
  const liveKitRoom = useLiveKitRoom();

  return (
    <RoomContext.Provider value={liveKitRoom}>
      <LiveKitScreenshareView trackId={trackId} />
    </RoomContext.Provider>
  );
};

export default LiveKitScreenshareViewContainer;
