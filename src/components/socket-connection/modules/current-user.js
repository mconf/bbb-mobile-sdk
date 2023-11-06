import Module from './module';
import { store } from '../../../store/redux/store';
import {
  addCurrentUser,
  editCurrentUser,
  removeCurrentUser,
  readyStateChanged,
  cleanupStaleData,
} from '../../../store/redux/slices/current-user';

const CURRENT_USER_TOPIC = 'current-user';

export class CurrentUserModule extends Module {
  constructor(messageSender) {
    super(CURRENT_USER_TOPIC, messageSender);
  }

  // eslint-disable-next-line class-methods-use-this
  _add(msgObj) {
    //inject userData to userSettings
    const customData = msgObj.fields.userdata;
    if (customData && Object.keys(customData).length > 0) {
      this.messageSender.makeCall('addUserSettings', [customData]);
    }
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

  // eslint-disable-next-line class-methods-use-this
  _cleanupStaleData(subscriptionId) {
    return store.dispatch(cleanupStaleData(subscriptionId));
  }
}
