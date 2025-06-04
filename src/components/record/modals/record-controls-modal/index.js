import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Pressable } from 'react-native';
import { Modal } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { hide } from '../../../../store/redux/slices/wide-app/modal';
import ViewerService from '../record-status-modal/service';
import useSetRecordingStatus from '../../../../graphql/hooks/useSetRecordingStatus';
import Styled from './styles';

const RecordControlsModal = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const modalCollection = useSelector((state) => state.modal);

  const recordMeeting = modalCollection?.extraInfo?.recordMeeting;
  const newTime = modalCollection?.extraInfo?.newTime;

  const isRecording = recordMeeting?.isRecording;
  const recordingTimeFromServer = recordMeeting?.previousRecordedTimeInSeconds ?? 0;
  const startedAt = recordMeeting?.startedAt ? new Date(recordMeeting.startedAt).getTime() : null;

  const [time, setTime] = useState(newTime);
  const intervalRef = useRef(null);

  const { toggleRecording } = useSetRecordingStatus();

  const handleToggleRecording = async () => {
    try {
      await toggleRecording(!isRecording);
      dispatch(hide());
    } catch (err) {
      console.error('[RecordControlsModal] Error toggling recording:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (isRecording && startedAt) {
        intervalRef.current = setInterval(() => {
          const now = Date.now();
          const elapsed = Math.floor((now - startedAt) / 1000);
          const totalTime = recordingTimeFromServer + elapsed;
          setTime(totalTime);
        }, 1000);
      } else {
        setTime(recordingTimeFromServer);
      }

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }, [isRecording, recordingTimeFromServer, startedAt])
  );

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
            <Pressable onPress={() => dispatch(hide())}>
              <Styled.CancelText>{t('app.settings.main.cancel.label')}</Styled.CancelText>
            </Pressable>
            <Styled.ConfirmButton
              onPress={handleToggleRecording}
              recording={isRecording}
            >
              {buttonText}
            </Styled.ConfirmButton>
          </Styled.ButtonContainer>
        </Styled.ModalContent>
      </Styled.ModalContainer>
    </Modal>
  );
};

export default RecordControlsModal;
