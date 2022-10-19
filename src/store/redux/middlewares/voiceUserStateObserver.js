import { createListenerMiddleware } from '@reduxjs/toolkit';
import {
  voiceStateChangeListener,
  voiceStateChangePredicate,
} from '../slices/voice-users';

// Middlewares
const voiceUserStateObserver = createListenerMiddleware();
voiceUserStateObserver.startListening({
  predicate: voiceStateChangePredicate,
  effect: voiceStateChangeListener,
});

export default voiceUserStateObserver;
