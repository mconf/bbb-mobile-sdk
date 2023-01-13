import makeCall from '../../../services/api/makeCall';
import logger from '../../../services/logger';

const handleChangeGuestPolicy = async (policyRule) => {
  try {
    await makeCall('changeGuestPolicy', policyRule);
  } catch (error) {
    logger.error({
      logCode: 'makeCall_changeGuestPolicy_exception',
      extraInfo: {
        error,
        policyRule
      },
    }, `GuestPolicy makeCall exception: ${error}`);
  }
};

export default {
  handleChangeGuestPolicy,
};
