import { store } from '../../../store/redux/store';
import {
  addGroupChatMsg,
  editGroupChatMsg,
  removeGroupChatMsg,
} from '../../../store/redux/slices/group-chat-msg';

const groupChatMsgTopic = 'group-chat-msg';

export class GroupChatMsgModule {
  constructor(messageSender) {
    this.messageSender = messageSender;
    this.subId = null;
  }

  onConnected() {
    this.subId = this.messageSender.subscribeMsg(groupChatMsgTopic, 0);
  }

  onDisconnected() {
    this.messageSender.unsubscribeMsg(groupChatMsgTopic, this.subId);
  }

  // eslint-disable-next-line class-methods-use-this
  onDisconnectedBeforeWebsocketClose() {
    // TODO
  }

  // eslint-disable-next-line class-methods-use-this
  add(msgObj) {
    return store.dispatch(
      addGroupChatMsg({
        groupChatMsgObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  remove(msgObj) {
    return store.dispatch(
      removeGroupChatMsg({
        groupChatMsgObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  update(msgObj) {
    return store.dispatch(
      editGroupChatMsg({
        groupChatMsgObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  processMessage() {
    // TODO
  }
}
