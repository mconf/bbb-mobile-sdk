import makeCall from '../../../services/api/makeCall';
import logger from '../../../services/logger';

const handleAllowPendingUsers = async (guestsArray, status) => {
  try {
    await makeCall('allowPendingUsers', guestsArray, status);
  } catch (error) {
    logger.error({
      logCode: 'makeCall_allowPendingUsers_exception',
      extraInfo: {
        error,
        guestsArray,
        status
      },
    }, `AllowPendingUsers makeCall exception: ${error}`);
  }
};

export default {
  handleAllowPendingUsers,
};
