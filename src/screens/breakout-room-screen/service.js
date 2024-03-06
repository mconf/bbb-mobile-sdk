import makeCall from '../../services/api/makeCall';

const requestJoinURL = (breakoutId) => {
  makeCall('requestJoinURL', {
    breakoutId,
  });
};

export default {
  requestJoinURL
};
