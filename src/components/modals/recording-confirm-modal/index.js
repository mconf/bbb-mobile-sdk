import React, { useState, useCallback } from 'react';
import { Pressable } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import Modal from 'react-native-modal';
import { closeModal } from '../../../store/redux/slices/wide-app/modal';
import { selectRecordMeeting } from '../../../store/redux/slices/record-meetings';
import Colors from '../../../constants/colors';
import Service from './service';
import ViewerService from '../recording-status-modal/service';
import Styled from './styles';

const RecordingConfirmModal = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isModalVisible = useSelector((state) => state.modal.isModalVisible);
  const recordMeeting = useSelector(selectRecordMeeting);

  const recordingTime = recordMeeting ? recordMeeting.time : 0;
  const recording = recordMeeting?.recording;

  const [time, setTime] = useState(recordingTime);

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

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const handleToggleRecording = () => {
    Service.handleToggleRecording();
    dispatch(closeModal());
  };

  return (
    <Modal
      isVisible={isModalVisible}
      animationIn="fadeIn"
      animationOut="fadeOut"
      backdropOpacity={0.5}
      onBackButtonPress={handleCloseModal}
      hasBackdrop={false}
      onBackdropPress={handleCloseModal}
    >
      <Styled.ModalContainer>
        <Styled.ModalContent>
          <Styled.ModalTop>
            <Styled.Title>{title}</Styled.Title>
            <Styled.CloseButton name="close" size={24} color="#1C1B1F" onPress={handleCloseModal} />
          </Styled.ModalTop>
          <Styled.TimeText>
            {ViewerService.humanizeSeconds(time)}
          </Styled.TimeText>
          <Styled.DividerContainer>
            <Styled.Divider />
          </Styled.DividerContainer>
          <Styled.Description>{description}</Styled.Description>
          <Styled.ButtonContainer>
            <Pressable onPress={handleCloseModal}>
              <Styled.CancelText>{t('app.settings.main.cancel.label')}</Styled.CancelText>
            </Pressable>
            <Styled.Button activeOpacity={0.8} onPress={handleToggleRecording}>
              <Styled.CloseButton
                name={recordMeeting?.recording ? 'pause' : 'radio-button-checked'}
                size={24}
                color={Colors.white}
              />
              <Styled.ButtonText>{title.split(' ')[0]}</Styled.ButtonText>
            </Styled.Button>
          </Styled.ButtonContainer>
        </Styled.ModalContent>
      </Styled.ModalContainer>
    </Modal>
  );
};

export default RecordingConfirmModal;
