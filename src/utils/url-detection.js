// URL detection utilities for routing between BBB join and Greenlight room URLs

const GREENLIGHT_PATTERNS = [
  // Standard Greenlight v2/v3 room URL: /rooms/<room-id>
  /\/rooms\/[\w-]+/,
  // Greenlight room with join suffix: /rooms/<room-id>/join
  /\/rooms\/[\w-]+\/join/,
];

const BBB_JOIN_PATTERN = /\/bigbluebutton\/api\/join/;

export const URL_TYPES = {
  BBB_JOIN: 'bbb_join',
  GREENLIGHT_ROOM: 'greenlight_room',
  INVALID: 'invalid',
  UNKNOWN: 'unknown',
};

/**
 * Detects the type of URL and returns structured information.
 * Uses the standard URL API for robust parsing.
 *
 * @param {string} url - The URL to detect
 * @returns {Object} - { type, url, reason? }
 */
export const detectUrlType = (url) => {
  if (!url || typeof url !== 'string') {
    return { type: URL_TYPES.INVALID, url: '', reason: 'empty_or_invalid' };
  }

  let parsed;
  try {
    parsed = new URL(url.trim());
  } catch {
    return { type: URL_TYPES.INVALID, url, reason: 'unparseable' };
  }

  // Validate protocol (security: reject javascript:, data:, file:)
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { type: URL_TYPES.INVALID, url: parsed.href, reason: 'unsupported_protocol' };
  }

  // Check for BBB join URL first (more specific pattern)
  if (BBB_JOIN_PATTERN.test(parsed.pathname)) {
    return { type: URL_TYPES.BBB_JOIN, url: parsed.href };
  }

  // Check for Greenlight room URL
  for (const pattern of GREENLIGHT_PATTERNS) {
    if (pattern.test(parsed.pathname)) {
      return { type: URL_TYPES.GREENLIGHT_ROOM, url: parsed.href };
    }
  }

  return { type: URL_TYPES.UNKNOWN, url: parsed.href };
};

/**
 * Legacy simple check for backward compatibility.
 * @param {string} url
 * @returns {boolean}
 */
export const isGreenlightRoomUrl = (url) => {
  const { type } = detectUrlType(url);
  return type === URL_TYPES.GREENLIGHT_ROOM;
};

/**
 * @param {string} url
 * @returns {boolean}
 */
export const isBbbJoinUrl = (url) => {
  const { type } = detectUrlType(url);
  return type === URL_TYPES.BBB_JOIN;
};
