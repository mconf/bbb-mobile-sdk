import { useSyncExternalStore } from 'react';

// The app substitutes the initial configuration into the document before it loads.
// Rebuilding the document would drop the Yjs connection, so mid-session changes
// arrive later through `window.bbbNotesUpdate`.

const readInjectedConfig = () => {
  const injected = window.__BBB_NOTES__;
  if (injected && typeof injected === 'object') return injected;
  return {};
};

let current = {
  padId: '',
  sessionToken: '',
  serverHostname: '',
  locale: 'en',
  defaultLocale: 'en',
  userName: '',
  userColor: '',
  isModerator: false,
  locked: true,
  disableNotes: false,
  staticFormattingToolbar: true,
  maxDocumentChars: 99999,
  maxLengthForContentUpdate: 1500,
  messages: {},
  ...readInjectedConfig(),
};

const listeners = new Set();

const getConfig = () => current;

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const update = (patch) => {
  if (!patch || typeof patch !== 'object') return;
  const next = { ...current, ...patch };
  const changed = Object.keys(patch).some((key) => next[key] !== current[key]);
  if (!changed) return;
  current = next;
  listeners.forEach((listener) => listener());
};

window.bbbNotesUpdate = update;

const useConfig = () => useSyncExternalStore(subscribe, getConfig);

// The app passes translations in already resolved; no i18n stack in here.
const t = (key, fallback) => {
  const messages = getConfig().messages || {};
  return messages[key] || fallback;
};

export {
  getConfig, useConfig, update, t,
};
