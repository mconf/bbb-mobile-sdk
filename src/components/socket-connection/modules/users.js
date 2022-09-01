import Module from './module';
import {
  addUser,
  removeUser,
  editUser,
} from '../../../store/redux/slices/users';
import { store } from '../../../store/redux/store';

const USERS_TOPIC = 'users';

export class UsersModule extends Module {
  constructor(messageSender) {
    super(USERS_TOPIC, messageSender);
  }

  // eslint-disable-next-line class-methods-use-this
  add(msgObj) {
    return store.dispatch(
      addUser({
        userObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  remove(msgObj) {
    return store.dispatch(
      removeUser({
        userObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  update(msgObj) {
    return store.dispatch(
      editUser({
        userObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  processMessage() {
    // TODO
  }
}
