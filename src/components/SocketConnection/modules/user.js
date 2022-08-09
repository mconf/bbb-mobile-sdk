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

  add(fields) {
    users[fields.id] = fields;
  }

  remove(id) {
    delete users[id];
  }

  update(id, fields) {
    // TODO
  }

  processMessage(msg) {
    return;
  }

}
