import React, { useEffect } from 'react';
import { Modal } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { selectCurrentExternalVideo } from '../../../store/redux/slices/external-video-meetings';
import { hide } from '../../../store/redux/slices/wide-app/modal';
import Styled from './styles';
import AudioSlider from '../audio-slider/AudioSlider';
import AudioPlayerService from '../service';

const AudioPlayerModal = () => {
  const modalCollection = useSelector((state) => state.modal);
  const host = useSelector((state) => state.client.meetingData.host);
  const { externalVideoUrl } = useSelector(selectCurrentExternalVideo);
  const uploadedFileCollection = useSelector(
    (state) => state.uploadedFileCollection.uploadedFileCollection
  );
  const externalVideoStream = useSelector(
    (state) => state.externalVideoMeetingsCollection.streamExternalVideoMeeting
  );
  const currTime = useSelector(
    (state) => state.externalVideoMeetingsCollection.streamExternalVideoMeeting?.id?.time
  );
  const currEvent = useSelector((state) => state.externalVideoMeetingsCollection.eventName);
  const sessionToken = useSelector((state) => state.client.meetingData.sessionToken);
  const soundUri = {
    uri: `https://${host}${externalVideoUrl}&sessionToken=${sessionToken}`
  };

  // get the filename
  const url = new URL(`https://${host}${externalVideoUrl}&sessionToken=${sessionToken}`);
  const params = new URLSearchParams(url.search);
  const filename = params.get('filename');

  const dispatch = useDispatch();

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
          filename={filename}
          audioSource={soundUri}
          positionFromServer={currTime}
          isPlayingFromServer={currEvent === 'play' || externalVideoStream?.id?.state === 1}
        />
      </Styled.Container>
    </Modal>
  );
};

export default AudioPlayerModal;
