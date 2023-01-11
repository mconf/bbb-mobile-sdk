import makeCall from '../../../services/api/makeCall';

const handleAllowPendingUsers = async (guestsArray, status) => {
  await makeCall('allowPendingUsers', guestsArray, status);
};

export default {
  handleAllowPendingUsers,
};
