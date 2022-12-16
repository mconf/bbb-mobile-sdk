import Module from './module';
import { store } from '../../../store/redux/store';
import {
  addPoll,
  removePoll,
  editPoll,
} from '../../../store/redux/slices/polls';
import { 
  hideNotification, 
  setProfile 
} from '../../../store/redux/slices/wide-app/notification-bar';

const POLLS_TOPIC = 'polls';

export class PollsModule extends Module {
  constructor(messageSender) {
    super(POLLS_TOPIC, messageSender);
  }

  // eslint-disable-next-line class-methods-use-this
  add(msgObj) {
    store.dispatch(
      addPoll({
        pollObject: msgObj,
      })
    );
    store.dispatch(setProfile('pollStarted'));
    setTimeout(() => {
      store.dispatch(hideNotification());
    }, 5000);
  }

  // eslint-disable-next-line class-methods-use-this
  remove(msgObj) {
    return store.dispatch(
      removePoll({
        pollObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  update(msgObj) {
    return store.dispatch(
      editPoll({
        pollObject: msgObj,
      })
    );
  }
}
