import { useMutation } from '@apollo/client';
import SET_RECORDING_STATUS from '../mutations/setRecordingStatus';

const useSetRecordingStatus = () => {
  const [setRecordingStatus, { loading, error }] = useMutation(SET_RECORDING_STATUS);

  const toggleRecording = async (recording) => {
    try {
      await setRecordingStatus({ variables: { recording } });
    } catch (err) {
      console.error('[useSetRecordingStatus] Failed to toggle recording:', err);
    }
  };

  return { toggleRecording, loading, error };
};

export default useSetRecordingStatus;
