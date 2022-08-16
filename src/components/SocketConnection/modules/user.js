import { addUser, removeUser } from '../../../store/redux/users';
import { store } from '../../../store/redux/store';

const _userTopic = 'users';
const users = {};

export class UserModule {
  constructor(messageSender) {
    _sender = messageSender;
  }

  onConnected() {
    _subId = _sender.subscribeMsg(_userTopic);
  }

  onDisconnected() {
    _sender.unsubscribeMsg(_userTopic, _subId);
  }

  onDisconnectedBeforeWebsocketClose() {
    // TODO
  }

  add(msgObj) {
    return store.dispatch(
      addUser({
        userObject: msgObj,
      })
    );
  }

  remove(msgObj) {
    return store.dispatch(
      removeUser({
        userObject: msgObj,
      })
    );
  }

  update(id, fields) {
    // TODO
  }

  processMessage(msg) {
    return;
  }
}
