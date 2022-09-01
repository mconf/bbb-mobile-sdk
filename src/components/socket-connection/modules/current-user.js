import Module from './module';
import { store } from '../../../store/redux/store';
import {
  addCurrentUser,
  editCurrentUser,
  removeCurrentUser,
} from '../../../store/redux/slices/current-user';

const CURRENT_USER_TOPIC = 'current-user';

export class CurrentUserModule extends Module {
  constructor(messageSender) {
    super(CURRENT_USER_TOPIC, messageSender);
  }

  // eslint-disable-next-line class-methods-use-this
  add(msgObj) {
    return store.dispatch(
      addCurrentUser({
        currentUserObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  remove(msgObj) {
    return store.dispatch(
      removeCurrentUser({
        currentUserObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  update(msgObj) {
    return store.dispatch(
      editCurrentUser({
        currentUserObject: msgObj,
      })
    );
  }
}
