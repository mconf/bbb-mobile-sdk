import { createListenerMiddleware } from '@reduxjs/toolkit';
import {
  voiceCallStateChangeListener,
  createVoiceCallStateChangePredicate,
} from '../slices/voice-call-states';

// One listener middleware per store: a createListenerMiddleware() instance owns
// its listener table (and cancelActiveListeners()), so it must never be shared
// between the main room's store and a nested breakout's store. `extra` is the
// AppInstance, which is how effects reach that App's managers.
const createVoiceCallStateObserver = (instance) => {
  const voiceCallStateObserver = createListenerMiddleware({ extra: instance });
  voiceCallStateObserver.startListening({
    predicate: createVoiceCallStateChangePredicate(instance),
    effect: voiceCallStateChangeListener,
  });

  return voiceCallStateObserver;
};

export default createVoiceCallStateObserver;
