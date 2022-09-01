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

  // eslint-disable-next-line class-methods-use-this
  add(msgObj) {
    return store.dispatch(
      addCurrentPoll({
        currentPollObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  remove(msgObj) {
    return store.dispatch(
      removeCurrentPoll({
        currentPollObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  update(msgObj) {
    return store.dispatch(
      editCurrentPoll({
        currentPollObject: msgObj,
      })
    );
  }
}
