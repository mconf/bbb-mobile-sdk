import Module from './module';
import { store } from '../../../store/redux/store';
import {
  addSlide,
  removeSlide,
  editSlide,
  readyStateChanged,
  cleanupStaleData,
} from '../../../store/redux/slices/slides';

const SLIDES_TOPIC = 'slides';

export class SlidesModule extends Module {
  constructor(messageSender) {
    super(SLIDES_TOPIC, messageSender);
  }

  // eslint-disable-next-line class-methods-use-this
  _add(msgObj) {
    return store.dispatch(
      addSlide({
        slideObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  _remove(msgObj) {
    if (!this._ignoreDeletions) {
      return store.dispatch(
        removeSlide({
          slideObject: msgObj,
        })
      );
    }

    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  _update(msgObj) {
    return store.dispatch(
      editSlide({
        slideObject: msgObj,
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
