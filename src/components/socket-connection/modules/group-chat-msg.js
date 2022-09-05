import { store } from '../../../store/redux/store';
import Module from './module';
import {
  addGroupChatMsg,
  editGroupChatMsg,
  removeGroupChatMsg,
} from '../../../store/redux/slices/group-chat-msg';

import { addPreviousPollPublished } from '../../../store/redux/slices/wide-app/previous-poll-published';

const GROUP_CHAT_MSG_TOPIC = 'group-chat-msg';

export class GroupChatMsgModule extends Module {
  constructor(messageSender) {
    super(GROUP_CHAT_MSG_TOPIC, messageSender);
  }

  onConnected() {
    this.topics.forEach((topic) => {
      this.subscribeToCollection(topic, 0);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  add(msgObj) {
    if (msgObj.fields.id.toString().includes('POLL_RESULT')) {
      store.dispatch(
        addPreviousPollPublished({
          previousPollPublishedObject: msgObj.fields.extra.pollResultData,
        })
      );
    }
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
}
