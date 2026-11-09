// In-memory action log shared by every App instance's root reducer (there can
// be two: main room + nested breakout). Entries are tagged with the instance id
// and the array is capped so it never grows unbounded across a long session.
const MAX_ENTRIES = 2000;
const reduxLog = ['redux_log_start'];
const conditions = ['cleanupStaleData', 'layout/trigDetailedInfo', 'debug/', 'layout/setDetailedInfo'];

const addToReduxLog = (action, appInstanceId) => {
  if (!conditions.some((el) => action.type?.includes(el))) {
    reduxLog.push(appInstanceId != null ? { appInstanceId, ...action } : action);

    if (reduxLog.length > MAX_ENTRIES) {
      // keep the sentinel first entry
      reduxLog.splice(1, reduxLog.length - MAX_ENTRIES);
    }
  }
  return null;
};

const getReduxLog = () => {
  return reduxLog;
};

export default {
  addToReduxLog,
  getReduxLog
};
