import Module from './module';
import { store } from '../../../store/redux/store';
import {
  hideNotification,
  setProfile
} from '../../../store/redux/slices/wide-app/notification-bar';
import {
  addBreakout,
  editBreakout,
  editTimeRemaining,
  removeBreakout,
  readyStateChanged,
  cleanupStaleData,
} from '../../../store/redux/slices/breakouts';

const BREAKOUTS_TOPIC = 'breakouts';

export class BreakoutsModule extends Module {
  constructor(messageSender) {
    super(BREAKOUTS_TOPIC, messageSender);
  }

  // eslint-disable-next-line class-methods-use-this
  _add(msgObj) {
    store.dispatch(
      addBreakout({
        breakoutObject: msgObj,
      })
    );
    store.dispatch(setProfile('breakoutsStarted'));
    setTimeout(() => {
      store.dispatch(hideNotification());
    }, 5000);
  }

  // eslint-disable-next-line class-methods-use-this
  _remove(msgObj) {
    if (!this._ignoreDeletions) {
      return store.dispatch(
        removeBreakout({
          breakoutObject: msgObj,
        })
      );
    }

    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  _update(msgObj) {
    // moving this update to outside breakoutObject because it is too much
    if (Object.values(msgObj.fields).length === 1
      && Object.keys(msgObj.fields)[0] === 'timeRemaining') {
      return store.dispatch(
        editTimeRemaining({
          timeRemaining: msgObj.fields.timeRemaining,
        })
      );
    }

    return store.dispatch(
      editBreakout({
        breakoutObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  _subscriptionStateChanged(newState) {
    return store.dispatch(readyStateChanged(newState));
  }

  // eslint-disable-next-line class-methods-use-this
  _cleanupStaleData(subscriptionId) {
    return store.dispatch(cleanupStaleData(subscriptionId));
  }
}
