export default class MethodTransactionManager {
  constructor() {
    this.transactions = new Map();
  }

  getTransaction(id) {
    return this.transactions.get(id);
  }

  addTransaction(transaction) {
    this.transactions.set(transaction.transactionId, transaction);
  }

  hasTransaction(transactionId) {
    return this.transactions.has(transactionId);
  }

  deleteTransaction(transactionId) {
    return this.transactions.delete(transactionId);
  }

  resolveTransaction(id, response) {
    const transaction = this.getTransaction(id);

    if (transaction) {
      transaction.resolve(response);
      this.deleteTransaction(id);
    }
  }

  rejectTransaction(id, response) {
    const transaction = this.getTransaction(id);

    if (transaction) {
      transaction.reject(response);
      this.deleteTransaction(id);
    }
  }
}
