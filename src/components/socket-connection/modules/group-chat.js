import { store } from '../../../store/redux/store';
import Module from './module';
import {
  addGroupChat,
  editGroupChat,
  removeGroupChat,
} from '../../../store/redux/slices/group-chat';

const GROUP_CHAT_TOPIC = 'group-chat';

export class GroupChatModule extends Module {
  constructor(messageSender) {
    super(GROUP_CHAT_TOPIC, messageSender);
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
}
