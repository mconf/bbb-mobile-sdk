import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Pressable } from 'react-native';
import { Modal } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { hide } from '../../../../store/redux/slices/wide-app/modal';
import { selectRecordMeeting } from '../../../../store/redux/slices/record-meetings';
import ViewerService from '../record-status-modal/service';
import Service from './service';
import Styled from './styles';

const RecordControlsModal = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const modalCollection = useSelector((state) => state.modal);
  const recordMeeting = useSelector(selectRecordMeeting);

  const recordingTime = recordMeeting ? recordMeeting.time : 0;
  const recording = recordMeeting?.recording;

  const [time, setTime] = useState(recordingTime || 0);

  let title = '';
  if (!recordMeeting?.recording) {
    title = recordMeeting?.time > 0
      ? t('app.recording.resumeTitle')
      : t('app.recording.startTitle');
  } else {
    title = t('app.recording.stopTitle');
  }

  const description = !recordMeeting?.recording
    ? t('app.recording.startDescription')
    : t('app.recording.stopDescription');

  useFocusEffect(
    useCallback(() => {
      let interval;

      if (recording) {
        interval = setInterval(() => {
          setTime((prevTime) => prevTime + 1);
        }, 1000);
      } else {
        clearInterval(interval);
      }

      return () => {
        clearInterval(interval);
      };
    }, [recording])
  );

  useFocusEffect(
    useCallback(() => {
      if (recordingTime > time) {
        setTime(recordingTime + 1);
      }
    }, [recordingTime])
  );

  const handleToggleRecording = () => {
    Service.handleToggleRecording();
    dispatch(hide());
  };

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
              recording={recordMeeting?.recording}
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
