import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Pressable } from 'react-native';
import { Modal } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { hide } from '../../../../store/redux/slices/wide-app/modal';
import useMeeting from '../../../../graphql/hooks/useMeeting';
import ViewerService from '../record-status-modal/service';
import useSetRecordingStatus from '../../../../graphql/hooks/useSetRecordingStatus';
import Styled from './styles';

const RecordControlsModal = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const modalCollection = useSelector((state) => state.modal);

  const { data } = useMeeting();
  const recordMeeting = data?.meeting?.[0]?.recording;

  const isRecording = recordMeeting?.isRecording ?? false;
  const recordingTimeFromServer = recordMeeting?.previousRecordedTimeInSeconds ?? 0;
  const startedAt = recordMeeting?.startedAt ? new Date(recordMeeting.startedAt).getTime() : null;

  const [time, setTime] = useState(recordingTimeFromServer);
  const intervalRef = useRef(null);

  const { toggleRecording } = useSetRecordingStatus();

  const handleToggleRecording = async () => {
    try {
      const recording = data?.meeting?.[0]?.recording?.isRecording;
      await toggleRecording(!recording);
      dispatch(hide());
    } catch (err) {
      console.error('[RecordControlsModal] Erro ao alternar gravação:', err);
    }
  };

  // Define título e descrição de acordo com o estado
  const title = !isRecording
    ? recordingTimeFromServer > 0
      ? t('app.recording.resumeTitle')
      : t('app.recording.startTitle')
    : t('app.recording.stopTitle');

  const description = !isRecording
    ? t('app.recording.startDescription')
    : t('app.recording.stopDescription');

  // Atualiza tempo com base no servidor e timestamp de início
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

          <Styled.TimeText>
            {ViewerService.humanizeSeconds(time)}
          </Styled.TimeText>

          <Styled.DividerContainer>
            <Styled.Divider />
          </Styled.DividerContainer>

          <Styled.Description>{description}</Styled.Description>

          <Styled.ButtonContainer>
            <Pressable onPress={() => dispatch(hide())}>
              <Styled.CancelText>{t('app.settings.main.cancel.label')}</Styled.CancelText>
            </Pressable>
            <Styled.ConfirmButton
              onPress={handleToggleRecording}
              recording={isRecording}
            >
              {title.split(' ')[0]}
            </Styled.ConfirmButton>
          </Styled.ButtonContainer>
        </Styled.ModalContent>
      </Styled.ModalContainer>
    </Modal>
  );
};

export default RecordControlsModal;
