import { createListenerMiddleware } from '@reduxjs/toolkit';
import { removeVideoStream, videoStreamCleanupListener } from '../slices/video-streams';

// Per-store factory; see voiceCallStateObserver.js for why.
const createVideoStreamCleanupObserver = (instance) => {
  const videoStreamCleanupObserver = createListenerMiddleware({ extra: instance });
  videoStreamCleanupObserver.startListening({
    actionCreator: removeVideoStream,
    effect: videoStreamCleanupListener,
  });

  return videoStreamCleanupObserver;
};

export default createVideoStreamCleanupObserver;
