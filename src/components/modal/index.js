import { useSelector } from 'react-redux';
import BreakoutInviteModal from '../../screens/breakout-room-screen/breakout-invite-modal';
import CantCreatePollModal from '../../screens/poll-screen/modals/cant-create-poll';
import ReceivePollModal from '../../screens/poll-screen/modals/receive-poll';
import PublishedPollModal from '../../screens/poll-screen/modals/published-poll';
import AudioDeviceSelectorModal from '../actions-bar/audio-device-selector-control/audio-device-selector-modal';
import NotImplementedModal from './not-implemented';

const ModalControllerComponent = () => {
  const modalCollection = useSelector((state) => state.modal);

  if (modalCollection.profile === 'breakout_invite') {
    return (
      <BreakoutInviteModal />
    );
  }
  if (modalCollection.profile === 'audio_device_selector') {
    return (
      <AudioDeviceSelectorModal />
    );
  }
  if (modalCollection.profile === 'not_implemented') {
    return (
      <NotImplementedModal />
    );
  }
  if (modalCollection.profile === 'create_poll_permission') {
    return (
      <CantCreatePollModal />
    );
  }
  if (modalCollection.profile === 'receive_poll') {
    return (
      <ReceivePollModal />
    );
  }
  if (modalCollection.profile === 'poll_published') {
    return (
      <PublishedPollModal />
    );
  }

  return null;
};

export default ModalControllerComponent;
