import Module from './module';
import { store } from '../../../store/redux/store';
import {
  addPresentation,
  removePresentation,
  editPresentation,
  readyStateChanged,
} from '../../../store/redux/slices/presentations';

const PRESENTATION_TOPIC = 'presentations';

export class PresentationsModule extends Module {
  constructor(messageSender) {
    super(PRESENTATION_TOPIC, messageSender);
  }

  // eslint-disable-next-line class-methods-use-this
  _add(msgObj) {
    return store.dispatch(
      addPresentation({
        presentationObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  _remove(msgObj) {
    if (!this._ignoreDeletions) {
      return store.dispatch(
        removePresentation({
          presentationObject: msgObj,
        })
      );
    }

    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  _update(msgObj) {
    return store.dispatch(
      editPresentation({
        presentationObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  _subscriptionStateChanged(newState) {
    return store.dispatch(readyStateChanged(newState));
  }
}
