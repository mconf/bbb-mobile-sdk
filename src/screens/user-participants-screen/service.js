import makeCall from '../../services/api/makeCall';

const handleChangeRole = async (userId, role) => {
  if (role === 'VIEWER') {
    await makeCall('changeRole', userId, 'MODERATOR');
    return;
  }
  await makeCall('changeRole', userId, 'VIEWER');
};

const makePresenter = (userId) => {
  makeCall('assignPresenter', userId);
};

export default {
  handleChangeRole,
  makePresenter
};
