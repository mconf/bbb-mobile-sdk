import { useSelector } from 'react-redux';
import BreakoutInviteModal from '../../screens/breakout-room-screen/breakout-invite-modal';
import CantCreatePollModal from '../../screens/poll-screen/modals/cant-create-poll';
import RecordControlsModal from '../record/modals/record-controls-modal';
import RecordStatusModal from '../record/modals/record-status-modal';
import ReceivePollModal from '../../screens/poll-screen/modals/receive-poll';
import PublishedPollModal from '../../screens/poll-screen/modals/published-poll';
import AudioDeviceSelectorModal from '../actions-bar/audio-device-selector-control/audio-device-selector-modal';
import NotImplementedModal from './not-implemented';
import PickRandomUserModal from '../../screens/pick-random-user-screen/modal';

const MODAL_COMPONENTS = {
  pick_random_user: PickRandomUserModal,
  breakout_invite: BreakoutInviteModal,
  audio_device_selector: AudioDeviceSelectorModal,
  not_implemented: NotImplementedModal,
  create_poll_permission: CantCreatePollModal,
  receive_poll: ReceivePollModal,
  poll_published: PublishedPollModal,
  record_controls: RecordControlsModal,
  record_status: RecordStatusModal,
};

const ModalControllerComponent = () => {
  const modalCollection = useSelector((state) => state.modal);
  const ModalComponent = MODAL_COMPONENTS[modalCollection.profile];

  if (!ModalComponent) {
    return null;
  }

  return <ModalComponent />;
};

export default ModalControllerComponent;
