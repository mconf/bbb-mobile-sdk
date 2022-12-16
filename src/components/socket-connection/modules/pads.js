import Module from './module';
import { store } from '../../../store/redux/store';
import { addPad, removePad, editPad } from '../../../store/redux/slices/pads';

const PADS_TOPIC = 'pads';

export class PadsModule extends Module {
  constructor(messageSender) {
    super(PADS_TOPIC, messageSender);
  }

  // eslint-disable-next-line class-methods-use-this
  _add(msgObj) {
    return store.dispatch(
      addPad({
        padObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  _remove(msgObj) {
    if (!this._ignoreDeletions) {
      return store.dispatch(
        removePad({
          padObject: msgObj,
        })
      );
    }

    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  _update(msgObj) {
    return store.dispatch(
      editPad({
        padObject: msgObj,
      })
    );
  }
}
