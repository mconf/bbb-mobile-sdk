import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import Styled from './styles';
import ScreenshareManager from '../../services/webrtc/screenshare-manager';

const Screenshare = (props) => {
  const { style } = props;
  const mediaStreamId = useSelector(
    (state) => state.screenshare.screenshareStream
  );
  const isConnected = useSelector((state) => state.screenshare.isConnected);

  // TODO decouple unsubscribe from component lifecycle
  useEffect(() => {
    return () => {
      ScreenshareManager.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!mediaStreamId) {
      ScreenshareManager.subscribe();
    }
  }, [mediaStreamId]);

  if (isConnected && mediaStreamId) {
    return <Styled.ScreenshareStream style={style} streamURL={mediaStreamId} />;
  }

  return <Styled.ScreenshareSkeleton />;
};

export default Screenshare;
