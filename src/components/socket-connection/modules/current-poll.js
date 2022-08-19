import { store } from '../../../store/redux/store';
import {
  addCurrentPoll,
  editCurrentPoll,
  removeCurrentPoll,
} from '../../../store/redux/current-poll';

const currentPollTopic = 'current-poll';

export class CurrentPollModule {
  constructor(messageSender) {
    this.messageSender = messageSender;
    this.subId = null;
  }

  onConnected() {
    this.subId = this.messageSender.subscribeMsg(currentPollTopic);
  }

  onDisconnected() {
    this.messageSender.unsubscribeMsg(currentPollTopic, this.subId);
  }

  // eslint-disable-next-line class-methods-use-this
  onDisconnectedBeforeWebsocketClose() {
    // TODO
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

  // eslint-disable-next-line class-methods-use-this
  processMessage() {
    // TODO
  }
}
