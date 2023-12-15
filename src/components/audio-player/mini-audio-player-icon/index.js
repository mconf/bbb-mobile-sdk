import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import AudioPlayerService from '../service';
import { setProfile } from '../../../store/redux/slices/wide-app/modal';
import AudioSlider from '../audio-slider';
import { selectCurrentExternalVideo } from '../../../store/redux/slices/external-video-meetings';
import ExpandedCard from '../../expandable-card';
import Styled from './styles';

const MiniAudioPlayer = () => {
  const host = useSelector((state) => state.client.meetingData.host);
  const externalVideoStreamUrl = useSelector(selectCurrentExternalVideo)?.externalVideoUrl;
  const uploadedFileCollection = useSelector(
    (state) => state.uploadedFileCollection.uploadedFileCollection
  );
  const uploadedFilesList = Object.values(uploadedFileCollection);
  const externalVideoStream = useSelector(
    (state) => state.externalVideoMeetingsCollection.streamExternalVideoMeeting
  );
  const currTime = useSelector(
    (state) => state.externalVideoMeetingsCollection.streamExternalVideoMeeting?.id?.time
  );
  const currEvent = useSelector((state) => state.externalVideoMeetingsCollection.eventName);
  const sessionToken = useSelector((state) => state.client.meetingData.sessionToken);
  const soundUri = {
    uri: `https://${host}${externalVideoStreamUrl}&sessionToken=${sessionToken}`
  };

  // get the filename
  const url = new URL(`https://${host}${externalVideoStreamUrl}&sessionToken=${sessionToken}`);
  const params = new URLSearchParams(url.search);
  const filename = params.get('filename');

  useEffect(() => {
    AudioPlayerService.handleStreamExternalVideosSubscription();
  }, [uploadedFileCollection]);

  // RETURN
  if (uploadedFilesList.length === 0) {
    return null;
  }

  return (
    <Styled.Container>
      <ExpandedCard
        content={(
          <Styled.PlayIcon />
      )}
        expandedContent={(
          <Styled.Card>
            <AudioSlider
              filename={filename}
              audioSource={soundUri}
              positionFromServer={currTime}
              isPlayingFromServer={currEvent === 'play' || externalVideoStream?.id?.state === 1}
            />
          </Styled.Card>
          )}
        expandableHeight={180}
        clickableWidth={48}
      />

    </Styled.Container>
  );
};

export default MiniAudioPlayer;
