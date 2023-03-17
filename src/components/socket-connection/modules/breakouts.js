import Module from './module';
import { store } from '../../../store/redux/store';
import {
  addBreakout,
  editBreakout,
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
    return store.dispatch(
      addBreakout({
        breakoutObject: msgObj,
      })
    );
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
