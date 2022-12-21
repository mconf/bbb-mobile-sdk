import Module from './module';
import {
  addUser,
  removeUser,
  editUser,
  readyStateChanged,
} from '../../../store/redux/slices/users';
import { store } from '../../../store/redux/store';

const USERS_TOPIC = 'users';

export class UsersModule extends Module {
  constructor(messageSender) {
    super(USERS_TOPIC, messageSender);
  }

  // eslint-disable-next-line class-methods-use-this
  _add(msgObj) {
    return store.dispatch(
      addUser({
        userObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  _remove(msgObj) {
    if (!this._ignoreDeletions) {
      return store.dispatch(
        removeUser({
          userObject: msgObj,
        })
      );
    }

    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  _update(msgObj) {
    return store.dispatch(
      editUser({
        userObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  _subscriptionStateChanged(newState) {
    return store.dispatch(readyStateChanged(newState));
  }
}
