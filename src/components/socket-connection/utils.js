import EJSON from 'ejson';
import logger from '../../services/logger';

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

// Ported from Meteor
const _isEmpty = (obj) => {
  if (obj == null) {
    return true;
  }

  if (Array.isArray(obj) || typeof obj === 'string') {
    return obj.length === 0;
  }

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return false;
    }
  }

  return true;
};

// Ported from Meteor
const parseDDP = (stringMessage) => {
  let msg;

  try {
    msg = JSON.parse(stringMessage);
    // Our (BBB) code -> string data comes as streams (arrays), SockJS - unwrap it
    msg = JSON.parse(msg[0]);
  } catch (error) {
    logger.debug({
      logCode: 'meteor_parse_invalid_json',
      extraInfo: {
        errorMessage: error.message,
        errorCode: error.code,
        stringMessage,
      },
    }, `Discarding message with invalid JSON=${stringMessage}`);

    return null;
  }

  // DDP messages must be objects.
  if (msg === null || typeof msg !== 'object') {
    logger.debug({
      logCode: 'meteor_parse_not_an_object',
      extraInfo: {
        stringMessage,
      },
    }, `Discarding non-object DDP message=${stringMessage}`);

    return null;
  }

  // massage msg to get it into "abstract ddp" rather than "wire ddp" format.
  // switch between "cleared" rep of unsetting fields and "undefined"
  // rep of same
  if (Object.prototype.hasOwnProperty.call(msg, 'cleared')) {
    if (!Object.prototype.hasOwnProperty.call(msg, 'fields')) {
      msg.fields = {};
    }
    msg.cleared.forEach((clearKey) => {
      msg.fields[clearKey] = undefined;
    });
    delete msg.cleared;
  }

  ['fields', 'params', 'result'].forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(msg, field)) {
      msg[field] = EJSON._adjustTypesFromJSONValue(msg[field]);
    }
  });

  return msg;
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
  stringifyDDP,
  parseDDP,
};
