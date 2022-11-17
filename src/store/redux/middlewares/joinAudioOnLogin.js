import { createListenerMiddleware } from '@reduxjs/toolkit';
import {
  joinAudioOnLoginPredicate,
  joinAudioOnLoginListener,
} from '../slices/voice-users';

// Middlewares
const joinAudioOnLogin = createListenerMiddleware();
joinAudioOnLogin.startListening({
  predicate: joinAudioOnLoginPredicate,
  effect: joinAudioOnLoginListener,
});

export default joinAudioOnLogin;
