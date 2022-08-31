import { store } from '../../../store/redux/store';
import {
  addGroupChat,
  editGroupChat,
  removeGroupChat,
} from '../../../store/redux/slices/group-chat';

const groupChatTopic = 'group-chat';

export class GroupChatModule {
  constructor(messageSender) {
    this.messageSender = messageSender;
    this.subId = null;
  }

  onConnected() {
    this.subId = this.messageSender.subscribeMsg(groupChatTopic);
  }

  onDisconnected() {
    this.messageSender.unsubscribeMsg(groupChatTopic, this.subId);
  }

  // eslint-disable-next-line class-methods-use-this
  onDisconnectedBeforeWebsocketClose() {
    // TODO
  }

  // eslint-disable-next-line class-methods-use-this
  add(msgObj) {
    return store.dispatch(
      addGroupChat({
        groupChatObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  remove(msgObj) {
    return store.dispatch(
      removeGroupChat({
        groupChatObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  update(msgObj) {
    return store.dispatch(
      editGroupChat({
        groupChatObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  processMessage() {
    // TODO
  }
}
