import { store } from '../../../store/redux/store';
import Module from './module';
import {
  addGroupChat,
  editGroupChat,
  removeGroupChat,
  readyStateChanged,
} from '../../../store/redux/slices/group-chat';

const GROUP_CHAT_TOPIC = 'group-chat';

export class GroupChatModule extends Module {
  constructor(messageSender) {
    super(GROUP_CHAT_TOPIC, messageSender);
  }

  // eslint-disable-next-line class-methods-use-this
  _add(msgObj) {
    return store.dispatch(
      addGroupChat({
        groupChatObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  _remove(msgObj) {
    if (!this._ignoreDeletions) {
      return store.dispatch(
        removeGroupChat({
          groupChatObject: msgObj,
        })
      );
    }

    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  _update(msgObj) {
    return store.dispatch(
      editGroupChat({
        groupChatObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  _subscriptionStateChanged(newState) {
    return store.dispatch(readyStateChanged(newState));
  }
}
