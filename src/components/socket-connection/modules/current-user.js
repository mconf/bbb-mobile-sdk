import { store } from '../../../store/redux/store';
import {
  addCurrentUser,
  editCurrentUser,
  removeCurrentUser,
} from '../../../store/redux/current-user';

const currentUserTopic = 'current-user';

export class CurrentUserModule {
  constructor(messageSender) {
    this.messageSender = messageSender;
    this.subId = null;
  }

  onConnected() {
    this.subId = this.messageSender.subscribeMsg(currentUserTopic);
  }

  onDisconnected() {
    this.messageSender.unsubscribeMsg(currentUserTopic, this.subId);
  }

  // eslint-disable-next-line class-methods-use-this
  onDisconnectedBeforeWebsocketClose() {
    // TODO
  }

  // eslint-disable-next-line class-methods-use-this
  add(msgObj) {
    return store.dispatch(
      addCurrentUser({
        currentUserObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  remove(msgObj) {
    return store.dispatch(
      removeCurrentUser({
        currentUserObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  update(msgObj) {
    return store.dispatch(
      editCurrentUser({
        currentUserObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  processMessage() {
    // TODO
  }
}
