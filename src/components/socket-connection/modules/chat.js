const _groupChatMessageTopic = "group-chat-msg";
const _groupChatTopic = "group-chat";
const _usersTypingTopic = "users-typing";

const chats = {};

export class ChatModule {

  constructor(messageSender) {
    _sender = messageSender;
  }

  onConnected() {
    _groupChatSubId = _sender.subscribeMsg(_groupChatTopic);
    _usersTypingSubId = _sender.subscribeMsg(_usersTypingTopic);
  }

  onDisconnected() {
    _sender.unsubscribeMsg(_groupChatTopic, _groupChatSubId);
    _sender.unsubscribeMsg(_usersTypingTopic, _usersTypingSubId);
  }

  onDisconnectedBeforeWebsocketClose() {
    // TODO
  }

  add(fields) {
    chats[fields.id] = fields;
  }

  remove(id) {
    delete chats[id];
  }

  update(id, fields) {
    // TODO
  }

  processMessage(msg) {
    return;
  }

}
