import MethodTransactionManager from '../method-transaction-manager';
import MethodTransaction from '../method-transaction';
import SubscribeTransaction from '../subscribe-transaction';

const STALE_DATA_DEBOUNCE = 1000;

export default class Module {
  constructor(topics, messageSender) {
    this.messageSender = messageSender;
    // Array<String> | String
    if (typeof topics === 'string') {
      this.topics = [topics];
    } else {
      this.topics = topics;
    }

    // Map<topic: String, subscriptionId: String>
    this.subscriptions = new Map();

    this._pendingTransactions = new MethodTransactionManager();
    this._ignoreDeletions = false;
  }

  subscribeToCollection(topic, ...args) {
    if (!this.subscriptions.has(topic)) {
      const transaction = new SubscribeTransaction(topic, args);
      this._pendingTransactions.addTransaction(transaction);
      this.messageSender.sendMessage(transaction.payload);
      this.subscriptions.set(topic, transaction.transactionId);
      return transaction.promise.then(() => {
        this._ignoreDeletions = false;
        this.subscriptionStateChanged(true);
      }).catch(() => {
        this._ignoreDeletions = false;
        this.subscriptions.delete(topic);
        this.subscriptionStateChanged(false);
      });
    }

    return this.subscriptions.get(topic);
  }

  onPublicationStopMarker(msgObj) {
    if (msgObj?.fields?.stopped) {
      this._ignoreDeletions = true;
      const topic = msgObj.collection;
      this.subscriptions.delete(topic);
      this.subscriptionStateChanged(false);
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
    this.subscriptionStateChanged(false);

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
    const topic = msgObj?.collection;
    // Annotate document with subscriptionId so that we can flush stale data
    msgObj.fields = { ...msgObj.fields, subscriptionId: this.subscriptions.get(topic) };

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

  subscriptionStateChanged(newState) {
    if (newState === true) this._checkForStaleData();
    this._subscriptionStateChanged(newState);
  }

  // Must be implemented by inheritors
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  _cleanupStaleData() {
  }

  _checkForStaleData() {
    setTimeout(() => {
      this.subscriptions.forEach((subscriptionId) => {
        this._cleanupStaleData(subscriptionId);
      });
    }, STALE_DATA_DEBOUNCE);
  }
}
