const _meetingTopic = 'meetings';
const meetings = {};

export class MeetingModule {

  constructor(messageSender) {
    _sender = messageSender;
  }

  onConnected() {
    _subId = _sender.subscribeMsg(_meetingTopic);
  }

  onDisconnected() {
    _sender.unsubscribeMsg(_meetingTopic, _subId);
  }

  onDisconnectedBeforeWebsocketClose() {
    // TODO
  }

  add(fields) {
    meetings[fields.id] = fields;
  }

  remove(id) {
    delete meetings[id];
  }

  update(id, fields) {
    // TODO
  }

  processMessage(msg) {
    return;
  }

}
