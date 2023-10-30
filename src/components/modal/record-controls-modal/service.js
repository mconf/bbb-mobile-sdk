import makeCall from '../../../services/api/makeCall';
import logger from '../../../services/logger';

// TODO ADD CUSTOM USER SETTING CHECK
const mayIRecord = (amIModerator, allowStartStopRecording) => {
  if (!allowStartStopRecording) return false;
  return amIModerator;
};

const handleToggleRecording = async () => {
  try {
    await makeCall('toggleRecording');
  } catch (error) {
    logger.error({
      logCode: 'makeCall_handleToggleRecording_exception',
      extraInfo: {
        error,
      },
    }, `ToggleRecording makeCall exception: ${error}`);
  }
};

export default {
  mayIRecord,
  handleToggleRecording
};
