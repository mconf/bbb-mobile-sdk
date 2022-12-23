import Module from './module';
import {
  addScreenshare,
  removeScreenshare,
  editScreenshare,
  readyStateChanged,
  cleanupStaleData,
} from '../../../store/redux/slices/screenshare';
import { store } from '../../../store/redux/store';

const SCREENSHARES_TOPIC = 'screenshare';

export class ScreenshareModule extends Module {
  constructor(messageSender) {
    super(SCREENSHARES_TOPIC, messageSender);
  }

  // eslint-disable-next-line class-methods-use-this
  _add(msgObj) {
    return store.dispatch(
      addScreenshare({
        screenshareObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  _remove(msgObj) {
    if (!this._ignoreDeletions) {
      return store.dispatch(
        removeScreenshare({
          screenshareObject: msgObj,
        })
      );
    }

    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  _update(msgObj) {
    return store.dispatch(
      editScreenshare({
        screenshareObject: msgObj,
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
