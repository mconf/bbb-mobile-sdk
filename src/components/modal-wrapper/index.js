import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View } from 'react-native';
import RecordingConfirmModal from '../modals/recording-confirm-modal';
import RecordingStatusModal from '../modals/recording-status-modal';
import { selectIsModalVisible, selectActiveModal, closeModal } from '../../store/redux/slices/wide-app/modal';

const ModalWrapper = ({ children }) => {
  const dispatch = useDispatch();
  const isModalVisible = useSelector(selectIsModalVisible);
  const activeModal = useSelector(selectActiveModal);

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Render the CustomModal component */}
      {isModalVisible && (
        (activeModal === 'recording-confirm' && <RecordingConfirmModal onClose={handleCloseModal} />)
        || (activeModal === 'recording-status' && <RecordingStatusModal onClose={handleCloseModal} />)
      )}

      {/* Render children screens */}
      {children}
    </View>
  );
};

export default ModalWrapper;
