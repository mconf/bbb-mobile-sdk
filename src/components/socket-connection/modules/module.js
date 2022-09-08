import { getRandomAlphanumeric } from '../utils';
import MethodTransactionManager from '../method-transaction-manager';
import MethodTransaction from '../method-transaction';

export default class Module {
  constructor(topics, messageSender) {
    this.messageSender = messageSender;
    // Array<String> | String
    if (typeof topics === 'string') {
      this.topics = [topics];
    } else {
      this.topics = topics;
    }

    // Map<String, String>
    this.subscriptions = new Map();

    this._pendingTransactions = new MethodTransactionManager();
  }

  subscribeToCollection(topic, ...args) {
    if (!this.subscriptions.has(topic)) {
      const id = getRandomAlphanumeric(17);
      this.messageSender.sendMessage({
        msg: 'sub',
        id,
        name: topic,
        params: [...args],
      });
      // FIXME wait for subscription to succeed
      this.subscriptions.set(topic, id);

      return id;
    }

    return this.subscriptions.get(topic);
  }

  unsubscribeFromCollection(topic) {
    const id = this.subscriptions.get(topic);

    if (id == null) return false;

    this.messageSender.sendMessage({
      msg: 'unsub',
      id,
    });

    return this.subscriptions.delete(id);
  }

  onConnected() {
    this.topics.forEach((topic) => {
      this.subscribeToCollection(topic);
    });
  }

  onDisconnected() {
    this.topics.forEach((topic) => {
      this.unsubscribeFromCollection(topic);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  onDisconnectedBeforeWebsocketClose() {
    console.debug('Needs to be implemented by the module');
  }

  // eslint-disable-next-line class-methods-use-this
  _processMessage() {
    // console.debug('Needs to be implemented by inheritors');
  }

  processMessage(msgObj) {
    switch (msgObj.msg) {
      case 'result': {
        if (typeof msgObj.error === 'object') {
          this._pendingTransactions.rejectTransaction(msgObj.id, msgObj.error);
        } else {
          this._pendingTransactions.resolveTransaction(
            msgObj.id,
            msgObj.result
          );
        }
        break;
      }

      default: {
        // console.log('default case');
      }
    }

    // _processMessage should be implemented by inheritors
    this._processMessage();
  }

  makeCall(name, ...args) {
    const transaction = new MethodTransaction(name, args);

    this._pendingTransactions.addTransaction(transaction);
    this.messageSender.sendMessage(transaction.payload);

    return transaction.promise;
  }
}
