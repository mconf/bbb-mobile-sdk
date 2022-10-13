import { sortUsersByName } from './users';

const sortWithCamera = (s1, s2) => {
  if (!s1.cameraId && !s2.cameraId) return 0;
  if (!s1.cameraId) return 1;
  if (!s2.cameraId) return -1;

  return 0;
};

const sortPin = (s1, s2) => {
  if (s1.pin) return -1;
  if (s2.pin) return 1;
  return 0;
};

const mandatorySorting = (s1, s2) => sortPin(s1, s2);

// lastFloorTime, descending
const sortVoiceActivity = (s1, s2) => {
  if (s2.lastFloorTime < s1.lastFloorTime) return -1;
  if (s2.lastFloorTime > s1.lastFloorTime) return 1;
  return 0;
};

const sortLocalVoiceActivity = (s1, s2) => mandatorySorting(s1, s2)
  || sortVoiceActivity(s1, s2)
  || sortWithCamera(s1, s2)
  || sortUsersByName(s1, s2);

const sortVideoStreams = (streams) => {
  const [localStreams, remoteStreams] = streams.reduce(([local, remote], stream) => {
    if (stream.local) {
      local.push(stream);
    } else {
      remote.push(stream);
    }
    return [local, remote];
  }, [[], []]);

  return [
    ...localStreams,
    ...(remoteStreams.sort(sortLocalVoiceActivity)),
  ];
};

export {
  sortLocalVoiceActivity,
  sortVideoStreams,
};
