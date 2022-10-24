import { createListenerMiddleware } from '@reduxjs/toolkit';
import { hide, setProfile } from '../slices/wide-app/notification-bar';
import { setIsHandRaised } from '../slices/wide-app/interactions';

// Create the middleware instance and methods
const notificationBarObserver = createListenerMiddleware();

// ** Listeners **
// Hand raised
notificationBarObserver.startListening({
  actionCreator: setIsHandRaised,
  effect: async (action, listenerApi) => {
    if (action.payload) {
      return listenerApi.dispatch(setProfile('handsUp'));
    }
    return listenerApi.dispatch(hide());
  }
});

// other listeners...

export default notificationBarObserver;
