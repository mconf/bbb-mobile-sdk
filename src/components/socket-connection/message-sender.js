import MethodTransaction from './method-transaction';

export default class MessageSender {
  constructor(ws, transactions) {
    this.ws = ws;
    this.transactions = transactions;
  }

  makeCall(name, ...args) {
    if (this.ws == null) throw new TypeError('Socket is not open');

    const transaction = new MethodTransaction(name, args);
    this.transactions.addTransaction(transaction);
    this.sendMessage(transaction.payload);

    return transaction.promise;
  }

  sendMessage(msgObj) {
    // TODO review this
    const msg = JSON.stringify(msgObj).replace(/"/g, '\\"');
    this.ws.send(`["${msg}"]`);
  }
}
