import Module from './module';
import { store } from '../../../store/redux/store';
import {
  addCurrentPoll,
  editCurrentPoll,
  removeCurrentPoll,
} from '../../../store/redux/slices/current-poll';

const CURRENT_POLL_TOPIC = 'current-poll';

export class CurrentPollModule extends Module {
  constructor(messageSender) {
    super(CURRENT_POLL_TOPIC, messageSender);
  }

  // TODO FIX THIS
  onConnected() {
    this.topics.forEach((topic) => {
      this.subscribeToCollection(topic, false, true);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  _add(msgObj) {
    return store.dispatch(
      addCurrentPoll({
        currentPollObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  _remove(msgObj) {
    if (!this._ignoreDeletions) {
      return store.dispatch(
        removeCurrentPoll({
          currentPollObject: msgObj,
        })
      );
    }

    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  _update(msgObj) {
    return store.dispatch(
      editCurrentPoll({
        currentPollObject: msgObj,
      })
    );
  }
}
