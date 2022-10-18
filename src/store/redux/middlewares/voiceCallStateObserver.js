import { createListenerMiddleware } from '@reduxjs/toolkit';
import {
  voiceCallStateChangeListener,
  voiceCallStateChangePredicate,
} from '../slices/voice-call-states';

// Middlewares
const voiceCallStateObserver = createListenerMiddleware();
voiceCallStateObserver.startListening({
  predicate: voiceCallStateChangePredicate,
  effect: voiceCallStateChangeListener,
});

export default voiceCallStateObserver;
