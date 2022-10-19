import makeCall from '../../services/api/makeCall';

const toggleMuteMicrophone = () => {
  makeCall('toggleVoice');
};

export {
  toggleMuteMicrophone,
};
