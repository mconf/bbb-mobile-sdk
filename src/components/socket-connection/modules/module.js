import MethodTransactionManager from '../method-transaction-manager';
import MethodTransaction from '../method-transaction';
import SubscribeTransaction from '../subscribe-transaction';

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
    this._ignoreDeletions = false;
  }

  subscribeToCollection(topic, ...args) {
    if (!this.subscriptions.has(topic)) {
      const transaction = new SubscribeTransaction(topic, args);
      this._pendingTransactions.addTransaction(transaction);
      this.messageSender.sendMessage(transaction.payload);
      return transaction.promise.then(() => {
        this.subscriptions.set(topic, transaction.transactionId);
        this._ignoreDeletions = false;
        this._subscriptionStateChanged(true);
      }).catch(() => {
        this._ignoreDeletions = false;
        this._subscriptionStateChanged(false);
      });
    }

    return this.subscriptions.get(topic);
  }

  onPublicationStopMarker(msgObj) {
    if (msgObj?.fields?.stopped) {
      this._ignoreDeletions = true;
      const topic = msgObj.collection;
      this.subscriptions.delete(topic);
      this._subscriptionStateChanged(false);
      // Force a re-subscription of affected modules
      this.onConnected();
    }
  }

  unsubscribeFromCollection(topic) {
    const id = this.subscriptions.get(topic);

    if (id == null) return false;

    this.messageSender.sendMessage({
      msg: 'unsub',
      id,
    });
    this._subscriptionStateChanged(false);

    return this.subscriptions.delete(topic);
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
    this.onDisconnected();
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

      // Subscription accepted
      case 'ready': {
        const { subs } = msgObj;
        if (subs && subs.length > 0) {
          subs.forEach((subscriptionId) => {
            this._pendingTransactions.resolveTransaction(subscriptionId, subscriptionId);
          });
        }
        break;
      }

      // Subscription refused
      case 'nosub': {
        if (typeof msgObj.error === 'object') {
          this._pendingTransactions.rejectTransaction(msgObj.id, msgObj.error);
        }
        break;
      }

      default:
        break;
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

  // Must be implemented by inheritors
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  _add(msgObj) {
    return false;
  }

  add(msgObj) {
    return this._add(msgObj);
  }

  // Must be implemented by inheritors
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  _remove(msgObj) {
    return false;
  }

  remove(msgObj) {
    return this._remove(msgObj);
  }

  // Must be implemented by inheritors
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  _update(msgObj) {
    return false;
  }

  update(msgObj) {
    return this._update(msgObj);
  }

  // Must be implemented by inheritors
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  _subscriptionStateChanged(newState) {
  }
}
