import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Modal } from 'react-native-paper';
import { hide } from '../../../../store/redux/slices/wide-app/modal';
import Styled from './styles';
import Service from './service';

const RecordStatusModal = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const modalCollection = useSelector((state) => state.modal);
  const isShow = modalCollection.isShow;
  const newTime = modalCollection?.extraInfo?.newTime;

  const recordMeeting = modalCollection?.extraInfo?.recordMeeting;
  const recordingTimeFromServer = recordMeeting?.previousRecordedTimeInSeconds ?? 0;
  const isRecording = recordMeeting?.isRecording ?? false;

  const [localTime, setLocalTime] = useState(newTime);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const startedAt = recordMeeting?.startedAt ? new Date(recordMeeting.startedAt).getTime() : null;

    if (isRecording && startedAt) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsedSinceStart = Math.floor((now - startedAt) / 1000);
        const updatedTime = recordingTimeFromServer + elapsedSinceStart;

        setLocalTime(updatedTime);
      }, 1000);
    } else {
      setLocalTime(recordingTimeFromServer);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRecording, recordingTimeFromServer, recordMeeting?.startedAt]);

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
            {Service.humanizeSeconds(localTime)}
          </Styled.TimeText>
          <Styled.Divider />
          <Styled.Description>{description}</Styled.Description>
        </Styled.ModalContent>
      </Styled.ModalContainer>
    </Modal>
  );
};

export default RecordStatusModal;
