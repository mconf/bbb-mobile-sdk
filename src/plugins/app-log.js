import logger from '../services/logger';
import { createDeferredLog } from './deferred-log';
import { isLoggerReady } from './log-ready';

const send = ({ level, record, message }) => logger[level](record, message);

// The plugin host's log for one App instance (see deferred-log.ts). In development
// builds, warnings and errors also go to the console at once. A developer then sees a
// duplicate or a failed plugin even when the join never starts.
export const createPluginHostLog = (store) => {
  const deferred = createDeferredLog(store, isLoggerReady, send);
  return {
    write: (level, record, message) => {
      // eslint-disable-next-line no-undef -- React Native's global
      if (__DEV__ && (level === 'warn' || level === 'error')) {
        // eslint-disable-next-line no-console
        console[level](`[plugins] ${message}`, record);
      }
      deferred.write(level, record, message);
    },
    dispose: deferred.dispose,
  };
};

export default createPluginHostLog;
