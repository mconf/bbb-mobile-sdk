import Module from './module';
import { store } from '../../../store/redux/store';
import {
  addPoll,
  removePoll,
  editPoll,
  readyStateChanged,
  cleanupStaleData,
} from '../../../store/redux/slices/polls';
import { hideNotification, setProfile } from '../../../store/redux/slices/wide-app/notification-bar';

const POLLS_TOPIC = 'polls';

export class PollsModule extends Module {
  constructor(messageSender) {
    super(POLLS_TOPIC, messageSender);
  }

  // eslint-disable-next-line class-methods-use-this
  _add(msgObj) {
    store.dispatch(
      addPoll({
        pollObject: msgObj,
      })
    );
    store.dispatch(setProfile('pollStarted'));
    return setTimeout(() => {
      store.dispatch(hideNotification());
    }, 5000);
  }

  // eslint-disable-next-line class-methods-use-this
  _remove(msgObj) {
    if (!this._ignoreDeletions) {
      return store.dispatch(
        removePoll({
          pollObject: msgObj,
        })
      );
    }

    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  _update(msgObj) {
    return store.dispatch(
      editPoll({
        pollObject: msgObj,
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
