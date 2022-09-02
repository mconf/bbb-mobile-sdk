import Module from './module';
import {
  addScreenshare,
  removeScreenshare,
  editScreenshare,
} from '../../../store/redux/slices/screenshare';
import { store } from '../../../store/redux/store';

const SCREENSHARES_TOPIC = 'screenshare';

export class ScreenshareModule extends Module {
  constructor(messageSender) {
    super(SCREENSHARES_TOPIC, messageSender);
  }

  // eslint-disable-next-line class-methods-use-this
  add(msgObj) {
    return store.dispatch(
      addScreenshare({
        screenshareObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  remove(msgObj) {
    return store.dispatch(
      removeScreenshare({
        screenshareObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  update(msgObj) {
    return store.dispatch(
      editScreenshare({
        screenshareObject: msgObj,
      })
    );
  }
}
