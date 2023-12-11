import React, {useEffect} from 'react';
import { Modal } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { hide } from '../../../store/redux/slices/wide-app/modal';
import Styled from './styles';
import AudioSlider from '../audio-slider/AudioSlider';
import AudioPlayerService from '../service';

const AudioPlayerModal = () => {
  const modalCollection = useSelector((state) => state.modal);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const uploadedFileCollection = useSelector(
    (state) => state.uploadedFileCollection.uploadedFileCollection
  );
  const uploadedFilesList = Object.values(uploadedFileCollection);
  const host = useSelector((state) => state.client.meetingData.host);
  const externalVideoStream = useSelector(
    (state) => state.externalVideoMeetingsCollection.streamExternalVideoMeeting
  );
  const currTime = useSelector(
    (state) => state.externalVideoMeetingsCollection.streamExternalVideoMeeting?.id?.time
  );
  const currEvent = useSelector((state) => state.externalVideoMeetingsCollection.eventName);
  const sessionToken = useSelector((state) => state.client.meetingData.sessionToken);
  const soundUri = {
    uri: `https://${host}/bigbluebutton/download/media/${uploadedFilesList[0].uploadId}?filename=${uploadedFilesList[0].filename}&sessionToken=${sessionToken}`
  };

  useEffect(() => {
    AudioPlayerService.handleStreamExternalVideosSubscription();
  }, [uploadedFileCollection]);

  useEffect(() => {
  }, [uploadedFileCollection]);

  return (
    <Modal
      visible={modalCollection.isShow}
      onDismiss={() => dispatch(hide())}
    >
      <Styled.Container>
        <Styled.TitleModal>
          Audio Player
        </Styled.TitleModal>
        <Styled.TitleDesc>
          A funcionalidade possibilita o compartilhamento de áudios sincronizados durante a sessão.
        </Styled.TitleDesc>
        <Styled.TitleDesc>
          O aúdio é controlado pelo apresentador da sessão.
        </Styled.TitleDesc>
        <Styled.DividerTinyBottom />
        <AudioSlider
          filename={uploadedFilesList[0].filename}
          audioSource={soundUri}
          positionFromServer={currTime}
          isPlayingFromServer={currEvent === 'play' || externalVideoStream?.id?.state === 1}
        />
      </Styled.Container>
    </Modal>
  );
};

export default AudioPlayerModal;
