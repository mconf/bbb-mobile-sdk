import { createListenerMiddleware } from '@reduxjs/toolkit';
import { logoutOrEjectionPredicate, logoutOrEjectionListener } from '../slices/current-user';

const logoutOrEjectionObserver = createListenerMiddleware();
logoutOrEjectionObserver.startListening({
  predicate: logoutOrEjectionPredicate,
  effect: logoutOrEjectionListener,
});

export default logoutOrEjectionObserver;
