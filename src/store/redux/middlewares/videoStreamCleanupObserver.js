import { createListenerMiddleware } from '@reduxjs/toolkit';
import { removeVideoStream, videoStreamCleanupListener } from '../slices/video-streams';

const videoStreamCleanupObserver = createListenerMiddleware();
videoStreamCleanupObserver.startListening({
  actionCreator: removeVideoStream,
  effect: videoStreamCleanupListener,
});

export default videoStreamCleanupObserver;
