import React from 'react';
import { Modal } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { hide } from '../../store/redux/slices/wide-app/modal';
import BreakoutInviteModal from '../../screens/breakout-room-screen/breakout-invite-modal';
import CantCreatePollModal from './poll/cant-create-poll';
import Styled from './styles';

const ModalControllerComponent = () => {
  const modalCollection = useSelector((state) => state.modal);
  const dispatch = useDispatch();

  if (modalCollection.profile === 'breakout_invite') {
    return (
      <BreakoutInviteModal />
    );
  }
  if (modalCollection.profile === 'create_poll_permission') {
    return (
      <CantCreatePollModal />
    );
  }

  return (
    <Modal
      visible={modalCollection.isShow}
      onDismiss={() => dispatch(hide())}
    >
      <Styled.Container>
        <Styled.TitleModal>
          A problem occurred
        </Styled.TitleModal>
      </Styled.Container>
    </Modal>
  );
};

export default ModalControllerComponent;
