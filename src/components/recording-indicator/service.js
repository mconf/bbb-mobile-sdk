import makeCall from '../../services/api/makeCall';
import logger from '../../services/logger';

// TODO ADD CUSTOM USER SETTING CHECK
const mayIRecord = (amIModerator, allowStartStopRecording) => {
  if (!allowStartStopRecording) return false;
  return amIModerator;
};

const humanizeSeconds = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return [
    minutes,
    seconds,
  ].map((x) => {
    if (x < 10) {
      return `0${x}`;
    }
    return x;
  },
  ).join(':');
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
  humanizeSeconds,
  handleToggleRecording
};
