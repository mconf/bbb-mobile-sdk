import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Modal } from 'react-native-paper';
import { hide } from '../../../../store/redux/slices/wide-app/modal';
import { selectRecordMeeting } from '../../../../store/redux/slices/record-meetings';
import Styled from './styles';
import Service from './service';

const RecordStatusModal = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const isShow = useSelector((state) => state.modal.isShow);
  const recordMeeting = useSelector(selectRecordMeeting);

  const recordingTime = recordMeeting ? recordMeeting.time : 0;
  const recording = recordMeeting?.recording;

  const [time, setTime] = useState(recordingTime);

  useEffect(() => {
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
  }, [recording]);

  useEffect(() => {
    if (recordingTime > time) {
      setTime(recordingTime + 1);
    }
  }, [recordingTime]);

  const handleCloseModal = () => {
    dispatch(hide());
  };

  const description = !recording
    ? t('app.notification.recordingStop')
    : t('app.notification.recordingStart');

  return (
    <Modal
      visible={isShow}
      onDismiss={() => dispatch(hide())}
    >
      <Styled.ModalContainer>
        <Styled.ModalContent>
          <Styled.CloseButton name="close" size={24} color="#1C1B1F" onPress={handleCloseModal} />
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
