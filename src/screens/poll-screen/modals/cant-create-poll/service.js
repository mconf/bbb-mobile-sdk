import makeCall from '../../../../services/api/makeCall';

const assignPresenter = (currentUserId) => {
  makeCall('assignPresenter', currentUserId);
};

export {
  assignPresenter,
};
