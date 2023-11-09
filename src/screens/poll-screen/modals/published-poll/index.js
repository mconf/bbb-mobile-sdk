import React from 'react';
import { Modal } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import PreviousPollCard from '../../previous-polls-screen/poll-card';
import { hide } from '../../../../store/redux/slices/wide-app/modal';
import Styled from './styles';

const PublishedPollModal = () => {
  const dispatch = useDispatch();
  const isShow = useSelector((state) => state.modal.isShow);
  const extraInfo = useSelector((state) => state.modal.extraInfo);

  return (
    <Modal
      visible={isShow}
      onDismiss={() => dispatch(hide())}
    >
      <Styled.Container>
        <PreviousPollCard pollObj={extraInfo} />
      </Styled.Container>
    </Modal>
  );
};

export default PublishedPollModal;
