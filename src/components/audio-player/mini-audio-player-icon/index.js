import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import AudioPlayerService from '../service';
import { setProfile } from '../../../store/redux/slices/wide-app/modal';
import Styled from './styles';

const MiniAudioPlayer = () => {
  const uploadedFileCollection = useSelector(
    (state) => state.uploadedFileCollection.uploadedFileCollection
  );
  const uploadedFilesList = Object.values(uploadedFileCollection);
  const dispatch = useDispatch();

  useEffect(() => {
    AudioPlayerService.handleStreamExternalVideosSubscription();
  }, [uploadedFileCollection]);

  useEffect(() => {
  }, [uploadedFileCollection]);

  // RETURN
  if (uploadedFilesList.length === 0) {
    return null;
  }

  return (
    <Styled.PlayIcon
      onPress={() => dispatch(setProfile({
        profile: 'audio_player',
      }))}
    />
  );
};

export default MiniAudioPlayer;
