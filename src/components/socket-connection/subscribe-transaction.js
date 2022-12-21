import Transaction from './transaction';

export default class SubscribeTransaction extends Transaction {
  constructor(name, args) {
    super('sub', args);
    this.name = name;
  }

  get payload() {
    return {
      id: this.transactionId,
      msg: this.msg,
      name: this.name,
      params: [...this.params],
    };
  }
}
