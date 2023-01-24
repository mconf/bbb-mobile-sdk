import EJSON from 'ejson';

// FIXME review random generators - definitely not ideal prlanzarin Jan 24 2023
const DIGITS = '1234567890';
const ALPHANUMERIC = 'abcdefghijklmnopqrstuvwxyz1234567890';
const ALPHANUMERIC_WITH_CAPS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
const HEX = 'abcdef1234567890';

const randomFromString = (chars, n) => {
  let result = '';
  const charsLength = typeof n === 'number' && n > 0 ? n : chars.length;

  for (let i = 0; i < charsLength; i += 1) {
    result += chars.charAt(Math.floor(Math.random() * charsLength));
  }

  return result;
};

const getRandomDigits = (n) => randomFromString(DIGITS, n);
const getRandomAlphanumeric = (n) => randomFromString(ALPHANUMERIC, n);
const getRandomAlphanumericWithCaps = (n) => randomFromString(ALPHANUMERIC_WITH_CAPS, n);
const getRandomHex = (n) => randomFromString(HEX, n);
const decodeMessage = (msg) => {
  let msgObj = {};

  try {
    msgObj = JSON.parse(msg);
    msgObj = JSON.parse(msgObj[0]);
  } catch {
    msgObj = {};
  }

  return msgObj;
};

// Ported from Meteor
const _isEmpty = (obj) => {
  if (obj == null) {
    return true;
  }

  if (Array.isArray(obj) || typeof obj === 'string') {
    return obj.length === 0;
  }

  for (const key in obj) {
    if (hasOwn.call(obj, key)) {
      return false;
    }
  }

  return true;
};

// Ported from Meteor
const stringifyDDP = (msg) => {
  const copy = EJSON.clone(msg);

  if (Object.prototype.hasOwnProperty.call(msg, 'fields')) {
    const cleared = [];

    Object.keys(msg.fields).forEach((key) => {
      const value = msg.fields[key];

      if (typeof value === 'undefined') {
        cleared.push(key);
        delete copy.fields[key];
      }
    });

    if (!_isEmpty(cleared)) {
      copy.cleared = cleared;
    }

    if (_isEmpty(copy.fields)) {
      delete copy.fields;
    }
  }
  ['fields', 'params', 'result'].forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(copy, field)) {
      copy[field] = EJSON._adjustTypesToJSONValue(copy[field]);
    }
  });

  if (msg.id && typeof msg.id !== 'string') {
    throw new Error('Message id is not a string');
  }

  return JSON.stringify(copy, 'utf8');
};

export {
  getRandomDigits,
  getRandomAlphanumeric,
  getRandomAlphanumericWithCaps,
  getRandomHex,
  decodeMessage,
  stringifyDDP,
};
