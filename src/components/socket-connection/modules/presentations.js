import { store } from '../../../store/redux/store';
import {
  addPresentation,
  removePresentation,
  editPresentation,
} from '../../../store/redux/presentations';

const presentationsTopic = 'presentations';

export class PresentationsModule {
  constructor(messageSender) {
    this.messageSender = messageSender;
    this.subId = null;
  }

  onConnected() {
    this.subId = this.messageSender.subscribeMsg(presentationsTopic);
  }

  onDisconnected() {
    this.messageSender.unsubscribeMsg(presentationsTopic, this.subId);
  }

  // eslint-disable-next-line class-methods-use-this
  onDisconnectedBeforeWebsocketClose() {
    // TODO
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

  // eslint-disable-next-line class-methods-use-this
  processMessage() {
    // TODO
  }
}
