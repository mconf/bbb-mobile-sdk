import { useTranslation } from 'react-i18next';
import { Modal } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import useSetRecordingStatus from '../../../../graphql/hooks/useSetRecordingStatus';
import { hide } from '../../../../store/redux/slices/wide-app/modal';
import PrimaryButton from '../../../buttons/primary-button';
import ViewerService from '../record-status-modal/service';
import useRecordingTime from '../../use-recording-time';
import Styled from './styles';

const RecordControlsModal = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const modalCollection = useSelector((state) => state.modal);

  const {
    time,
    isRecording,
    previousRecordedTimeInSeconds: recordingTimeFromServer,
  } = useRecordingTime();

  const { toggleRecording } = useSetRecordingStatus();

  const handleToggleRecording = async () => {
    try {
      await toggleRecording(!isRecording);
      dispatch(hide());
    } catch (err) {
      console.error('[RecordControlsModal] Error toggling recording:', err);
    }
  };

  const title = !isRecording
    ? recordingTimeFromServer > 0
      ? t('app.recording.resumeTitle')
      : t('app.recording.startTitle')
    : t('app.recording.stopTitle');

  const buttonText = !isRecording
    ? recordingTimeFromServer > 0
      ? t('app.recording.resumeButton')
      : t('app.recording.startButton')
    : t('app.recording.stopButton');

  const description = !isRecording
    ? t('app.recording.startDescription')
    : t('app.recording.stopDescription');

  return (
    <Modal
      visible={modalCollection.isShow}
      onDismiss={() => dispatch(hide())}
    >
      <Styled.ModalContainer>
        <Styled.ModalContent>
          <Styled.ModalTop>
            <Styled.Title>{title}</Styled.Title>
          </Styled.ModalTop>

          {isRecording && (
            <>
              <Styled.TimeText>
                {ViewerService.humanizeSeconds(time)}
              </Styled.TimeText>
              <Styled.DividerContainer>
                <Styled.Divider />
              </Styled.DividerContainer>
            </>
          )}

          <Styled.Description>{description}</Styled.Description>

          <Styled.ButtonContainer>
            <PrimaryButton
              onPress={() => dispatch(hide())}
              variant="secondary"
              mode="darkText"
              fullWidth={false}
            >
              {t('app.settings.main.cancel.label')}
            </PrimaryButton>
            <PrimaryButton
              onPress={handleToggleRecording}
              variant="tertiary"
              fullWidth={false}
            >
              {buttonText}
            </PrimaryButton>
          </Styled.ButtonContainer>
        </Styled.ModalContent>
      </Styled.ModalContainer>
    </Modal>
  );
};

export default RecordControlsModal;
