import Module from './module';

const GROUP_CHAT_MSG_TOPIC = "group-chat-msg";
const GROUP_CHAT_TOPIC = "group-chat";
const USERS_TYPING_TOPIC = "users-typing";

const chats = {};

export class ChatModule extends Module {
  constructor(messageSender) {
    super([
      GROUP_CHAT_TOPIC,
      USERS_TYPING_TOPIC,
    ], messageSender);
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
}
