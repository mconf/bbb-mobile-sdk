const reduxLog = ['redux_log_start'];
const conditions = ['cleanupStaleData', 'layout/trigDetailedInfo', 'debug/', 'layout/setDetailedInfo'];

const addToReduxLog = (str) => {
  if (!conditions.some((el) => str.type?.includes(el))) {
    reduxLog.push(str);
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
