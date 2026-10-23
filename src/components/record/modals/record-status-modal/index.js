import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Modal } from 'react-native-paper';
import { hide } from '../../../../store/redux/slices/wide-app/modal';
import Styled from './styles';
import Service from './service';
import useRecordingTime from '../../use-recording-time';

const RecordStatusModal = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const modalCollection = useSelector((state) => state.modal);
  const isShow = modalCollection.isShow;
  const { time, isRecording } = useRecordingTime();

  const handleCloseModal = () => {
    dispatch(hide());
  };

  const description = !isRecording
    ? t('app.notification.recordingStop')
    : t('app.notification.recordingStart');

  return (
    <Modal visible={isShow} onDismiss={handleCloseModal}>
      <Styled.ModalContainer>
        <Styled.ModalContent>
          <Styled.CloseButton
            name="close"
            size={24}
            color="#1C1B1F"
            onPress={handleCloseModal}
          />
          <Styled.TimeText>
            {Service.humanizeSeconds(time)}
          </Styled.TimeText>
          <Styled.Divider />
          <Styled.Description>{description}</Styled.Description>
        </Styled.ModalContent>
      </Styled.ModalContainer>
    </Modal>
  );
};

export default RecordStatusModal;
