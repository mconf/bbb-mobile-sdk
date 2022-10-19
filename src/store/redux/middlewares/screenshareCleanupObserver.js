import { createListenerMiddleware } from '@reduxjs/toolkit';
import { removeScreenshare, screenshareCleanupListener } from '../slices/screenshare';

const screenshareCleanupObserver = createListenerMiddleware();
screenshareCleanupObserver.startListening({
  actionCreator: removeScreenshare,
  effect: screenshareCleanupListener,
});

export default screenshareCleanupObserver;
