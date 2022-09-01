import Module from './module';
import { store } from '../../../store/redux/store';
import {
  addPresentation,
  removePresentation,
  editPresentation,
} from '../../../store/redux/slices/presentations';

const PRESENTATION_TOPIC = 'presentations';

export class PresentationsModule extends Module {
  constructor(messageSender) {
    super(PRESENTATION_TOPIC, messageSender);
  }

  // eslint-disable-next-line class-methods-use-this
  add(msgObj) {
    return store.dispatch(
      addPresentation({
        presentationObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  remove(msgObj) {
    return store.dispatch(
      removePresentation({
        presentationObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  update(msgObj) {
    return store.dispatch(
      editPresentation({
        presentationObject: msgObj,
      })
    );
  }
}
