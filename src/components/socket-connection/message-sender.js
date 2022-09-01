export default class MessageSender {
  constructor(ws) {
    this.ws = ws;
  }

  sendMessage(msgObj) {
    // TODO review this
    const msg = JSON.stringify(msgObj).replace(/"/g, '\\"');
    this.ws.send(`["${msg}"]`);
  }
}
