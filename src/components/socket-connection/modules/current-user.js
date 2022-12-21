import Module from './module';
import { store } from '../../../store/redux/store';
import {
  addCurrentUser,
  editCurrentUser,
  removeCurrentUser,
  readyStateChanged,
} from '../../../store/redux/slices/current-user';

const CURRENT_USER_TOPIC = 'current-user';

export class CurrentUserModule extends Module {
  constructor(messageSender) {
    super(CURRENT_USER_TOPIC, messageSender);
  }

  // eslint-disable-next-line class-methods-use-this
  _add(msgObj) {
    return store.dispatch(
      addCurrentUser({
        currentUserObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  _remove(msgObj) {
    if (!this._ignoreDeletions) {
      return store.dispatch(
        removeCurrentUser({
          currentUserObject: msgObj,
        })
      );
    }

    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  _update(msgObj) {
    return store.dispatch(
      editCurrentUser({
        currentUserObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  _subscriptionStateChanged(newState) {
    return store.dispatch(readyStateChanged(newState));
  }
}
