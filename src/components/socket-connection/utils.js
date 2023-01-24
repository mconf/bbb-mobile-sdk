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

export {
  getRandomDigits,
  getRandomAlphanumeric,
  getRandomAlphanumericWithCaps,
  getRandomHex,
  decodeMessage,
};
