import { store } from '../../../store/redux/store';

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

// TODO move to a dedicate user sorting util
const sortUsersByName = (a, b) => {
  const aName = a.name ? a.name.toLowerCase() : '';
  const bName = b.name ? b.name.toLowerCase() : '';

  return aName.localeCompare(bName);
};

const sortLocalVoiceActivity = (s1, s2) => mandatorySorting(s1, s2)
  || sortVoiceActivity(s1, s2)
  || sortWithCamera(s1, s2)
  || sortUsersByName(s1, s2);

const sortVideoStreams = (streams) => {
  const currentUserStore = store.getState().currentUserCollection;
  const myUserId = Object.values(currentUserStore?.currentUserCollection)[0]?.userId;
  const [localStreams, remoteStreams] = streams.reduce(([local, remote], stream) => {
    if (myUserId && stream.userId === myUserId) {
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
