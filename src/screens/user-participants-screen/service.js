import makeCall from '../../services/api/makeCall';

const handleChangeRole = async (userId, role) => {
  if (role === 'VIEWER') {
    await makeCall('changeRole', userId, 'MODERATOR');
    return;
  }
  await makeCall('changeRole', userId, 'VIEWER');
};

export default {
  handleChangeRole
};
