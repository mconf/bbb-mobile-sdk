import { getRandomAlphanumeric } from './utils';

export default class MethodTransaction {
  constructor(name, ...args) {
    this.msg = 'method';
    this.method = name;
    this.params = [...args];
    this.transactionId = getRandomAlphanumeric(17);
    // A bit of a defer antipattern, I'll leave it to the highlanders
    // to improve - prlanzarin 31/08/22
    this.response = null;
    this.promise = new Promise((resolve, reject) => {
      let isResolved = false;
      this.resolveResponse = (response) => {
        if (!isResolved) {
          isResolved = true;
          resolve(response);
        }
      };
      this.rejectResponse = (response) => {
        if (!isResolved) {
          isResolved = true;
          reject(response);
        }
      };
    });
  }

  get payload() {
    return {
      id: this.transactionId,
      msg: this.msg,
      method: this.method,
      params: this.params,
    };
  }

  resolve(response) {
    this.resolveResponse(response);
  }

  reject(response) {
    this.rejectResponse(response);
  }
}
