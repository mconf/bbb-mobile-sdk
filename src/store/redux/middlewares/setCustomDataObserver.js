import { createListenerMiddleware } from '@reduxjs/toolkit';
import { setCustomDataListener, setCustomDataPredicate } from '../slices/current-user';

const setCustomDataObserver = createListenerMiddleware();
setCustomDataObserver.startListening({
  predicate: setCustomDataPredicate,
  effect: setCustomDataListener,
});

export default setCustomDataObserver;
