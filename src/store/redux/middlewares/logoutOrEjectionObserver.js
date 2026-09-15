import { createListenerMiddleware } from '@reduxjs/toolkit';
import { logoutOrEjectionPredicate, logoutOrEjectionListener } from '../slices/current-user';

// Per-store factory; see voiceCallStateObserver.js for why.
const createLogoutOrEjectionObserver = (instance) => {
  const logoutOrEjectionObserver = createListenerMiddleware({ extra: instance });
  logoutOrEjectionObserver.startListening({
    predicate: logoutOrEjectionPredicate,
    effect: logoutOrEjectionListener,
  });

  return logoutOrEjectionObserver;
};

export default createLogoutOrEjectionObserver;
