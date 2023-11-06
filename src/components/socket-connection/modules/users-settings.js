import Module from './module';
import {
  addUsersSettings,
  removeUsersSettings,
  editUsersSettings,
  readyStateChanged,
  cleanupStaleData,
} from '../../../store/redux/slices/users-settings';
import { store } from '../../../store/redux/store';

const USERS_SETTINGS_TOPIC = 'users-settings';

export class UsersSettingsModule extends Module {
  constructor(messageSender) {
    super(USERS_SETTINGS_TOPIC, messageSender);
  }

  // eslint-disable-next-line class-methods-use-this
  _add(msgObj) {
    return store.dispatch(
      addUsersSettings({
        usersSettingsObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  _remove(msgObj) {
    if (!this._ignoreDeletions) {
      return store.dispatch(
        removeUsersSettings({
          usersSettingsObject: msgObj,
        })
      );
    }

    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  _update(msgObj) {
    return store.dispatch(
      editUsersSettings({
        usersSettingsObject: msgObj,
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
