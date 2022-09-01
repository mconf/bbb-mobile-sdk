import Module from './module';
import { store } from '../../../store/redux/store';
import { addPad, removePad, editPad } from '../../../store/redux/slices/pads';

const PADS_TOPIC = 'pads';

export class PadsModule extends Module {
  constructor(messageSender) {
    super(PADS_TOPIC, messageSender);
  }

  // eslint-disable-next-line class-methods-use-this
  add(msgObj) {
    return store.dispatch(
      addPad({
        padObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  remove(msgObj) {
    return store.dispatch(
      removePad({
        padObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  update(msgObj) {
    return store.dispatch(
      editPad({
        padObject: msgObj,
      })
    );
  }
}
