const randomFromString = (chars, n) => {
  let result = '';
  const charsLength = chars.length;

  for (let i = 0; i < charsLength; i++) {
    result += chars.charAt(Math.floor(Math.random() * charsLength));
  }

  return result;
}

const DIGITS = "1234567890";
const ALPHANUMERIC = "abcdefghijklmnopqrstuvwxyz1234567890";
const ALPHANUMERIC_WITH_CAPS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
const HEX = "abcdef1234567890";

const MainWebSocketUtil = {
  getRandomDigits: (n) => randomFromString(DIGITS, n),
  getRandomAlphanumeric: (n) => randomFromString(ALPHANUMERIC, n),
  getRandomAlphanumericWithCaps: (n) => randomFromString(ALPHANUMERIC_WITH_CAPS, n),
  getRandomHex: (n) => randomFromString(HEX, n),

  decodeMessage: (msg) => {
    let msgObj = {};

    try {
      msgObj = JSON.parse(msg);
      msgObj = JSON.parse(msgObj[0]);
    } catch {
      msgObj = {}
    }

    return msgObj;
  },

}

module.exports = MainWebSocketUtil;
