import { StreamExternalVideoModule } from '../../components/socket-connection/stream/external-videos';
import { GLOBAL_MESSAGE_SENDER } from '../../components/socket-connection/index';

// TODO BAD FIX THIS
const handleStreamExternalVideosSubscription = () => {
  const SEVModule = new StreamExternalVideoModule(GLOBAL_MESSAGE_SENDER);
  SEVModule.onConnected();
};

// TODO BAD FIX THIS
const handleStreamExternalVideosDisconnect = () => {
  const SEVModule = new StreamExternalVideoModule(GLOBAL_MESSAGE_SENDER);
  SEVModule.onDisconnected();
};

export default {
  handleStreamExternalVideosSubscription,
  handleStreamExternalVideosDisconnect,
};
