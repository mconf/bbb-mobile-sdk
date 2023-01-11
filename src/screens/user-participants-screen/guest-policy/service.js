import makeCall from '../../../services/api/makeCall';

const handleChangeGuestPolicy = async (policyRule) => {
  await makeCall('changeGuestPolicy', policyRule);
};

export default {
  handleChangeGuestPolicy,
};
