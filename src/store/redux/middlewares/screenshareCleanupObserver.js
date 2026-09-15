import { createListenerMiddleware } from '@reduxjs/toolkit';
import { removeScreenshare, screenshareCleanupListener } from '../slices/screenshare';

// Per-store factory; see voiceCallStateObserver.js for why.
const createScreenshareCleanupObserver = (instance) => {
  const screenshareCleanupObserver = createListenerMiddleware({ extra: instance });
  screenshareCleanupObserver.startListening({
    actionCreator: removeScreenshare,
    effect: screenshareCleanupListener,
  });

  return screenshareCleanupObserver;
};

export default createScreenshareCleanupObserver;
