import { useSelector } from 'react-redux';
import BreakoutInviteModal from '../../screens/breakout-room-screen/breakout-invite-modal';
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

  return null;
};

export default ModalControllerComponent;
