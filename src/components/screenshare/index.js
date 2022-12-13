import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import Styled from './styles';
import ScreenshareManager from '../../services/webrtc/screenshare-manager';
import { selectScreenshare } from '../../store/redux/slices/screenshare';

const Screenshare = (props) => {
  const { style } = props;
  const screenshare = useSelector(selectScreenshare);
  const mediaStreamId = useSelector((state) => state.screenshare.screenshareStream);
  const isConnected = useSelector((state) => state.screenshare.isConnected);
  const clientIsReady = useSelector(({ client }) => {
    return client.connectionStatus.isConnected
      && client.sessionState.connected
      && client.sessionState.loggedIn;
  });

  useEffect(() => {
    if (clientIsReady && !mediaStreamId && screenshare) {
      ScreenshareManager.subscribe();
    }
  }, [clientIsReady, mediaStreamId, screenshare]);

  if (isConnected && mediaStreamId) {
    return <Styled.ScreenshareStream style={style} streamURL={mediaStreamId} />;
  }

  return <Styled.ScreenshareSkeleton />;
};

export default Screenshare;
