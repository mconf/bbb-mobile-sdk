// There is no console to read on a device, so `logger` mirrors the web client's
// shape and the app forwards it to the SDK's logger.

const post = (payload) => {
  try {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(payload));
    }
  } catch (error) {
    // The bridge is best-effort: never let a failed post break the editor.
  }
};

const makeLogEntry = (level) => (meta, message) => post({
  type: 'log',
  level,
  logCode: meta && meta.logCode,
  extraInfo: (meta && meta.extraInfo) || {},
  message,
});

const logger = {
  debug: makeLogEntry('debug'),
  info: makeLogEntry('info'),
  warn: makeLogEntry('warn'),
  error: makeLogEntry('error'),
};

// The web client's `notify(message, type)`; the app owns the presentation.
const notify = (message, level) => post({ type: 'notify', level, message });

const emit = (event, payload) => post({ type: 'event', event, payload });

export { post, logger, notify, emit };
