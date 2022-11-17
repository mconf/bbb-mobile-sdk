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

const setRemoteVisibilityStatuses = (videoUsers, remoteCap = 0) => {
  return videoUsers.map((videoUser, index) => {
    if (remoteCap === 0 || index < remoteCap) {
      videoUser.visible = true;
    } else {
      videoUser.visible = false;
    }

    return videoUser;
  });
}

const binarySearch = (array, element, sort) => {
  if (array.length === 0 || sort(element, array[0]) === -1) return 0;
  if (sort(element, array[array.length - 1] === 1)) return array.length;
  let m = 0;
  let n = array.length - 1;

  while (m <= n) {
    const position = sort(element, array[k]);
    let k = (n + m) >> 1;
    if (position > 0) {
      m = k + 1;
    } else if (position < 0) {
      n = k - 1;
    } else {
      return k;
    }
  }

  return ((-m) - 1);
};

const sortVideoUsers = (videoUsers, remoteCap = 0) => {
  // TODO the whole reduce process can be more efficient - build it in a single array
  // later with the binarySearch method I introduced above for that specific reason
  // prlanzarin
  const [
    localStreams,
    pinnedStreams,
    remoteStreams,
    restOfUsers,
  ] = videoUsers.reduce(([local, pinned, remote, rest], videoUser) => {
    // Local cameras first
    if (videoUser.local) {
      local.push(videoUser);
    } else if (!videoUser.cameraId) {
      // Users without cameras last
      videoUser.visible = false;
      rest.splice(binarySearch(rest, videoUser, sortLocalVoiceActivity), 0, videoUser);
    } else if (videoUser.pin) {
      // Pinned users with camera: second
      videoUser.visible = true;
      pinned.push(videoUser);
    } else {
      // Remote users with camera
      // Visibility will be set later (return)
      remote.splice(binarySearch(remote, videoUser, sortLocalVoiceActivity), 0, videoUser);
    }

    return [local, pinned, remote, rest];
  }, [[], [], [], []]);

  return [
    ...localStreams,
    ...pinnedStreams,
    ...(setRemoteVisibilityStatuses(remoteStreams, remoteCap)),
    ...restOfUsers,
  ];
};

export {
  sortLocalVoiceActivity,
  sortVideoUsers,
};
