import type { HostLog, HostLogLevel, HostLogRecord } from './log';

interface Entry { level: HostLogLevel; record: HostLogRecord; message: string }

interface Store {
  getState(): unknown;
  subscribe(listener: () => void): () => void;
}

export interface DeferredLog {
  write: HostLog;
  dispose(): void;
}

// The plugin host loads plugins when the App mounts, before the join tells the
// logger where to send records and which meeting they belong to. A record written
// then is dropped, or goes to the previous meeting's server untagged. So records
// wait until `isReady` says the store has what the logger needs, then go to `send`
// in order, as later ones do.
//
// Once the App instance is disposed (on unmount), records are dropped, waiting ones
// included. The logger would send them to the server it last used, or to none.
export function createDeferredLog(
  store: Store,
  isReady: (state: unknown) => boolean,
  send: (entry: Entry) => void,
): DeferredLog {
  let pending: Entry[] | null = [];
  let disposed = false;
  let unsubscribe: (() => void) | null = null;

  const stopListening = () => {
    unsubscribe?.();
    unsubscribe = null;
  };

  // The release runs inside the join's store dispatch. A record that fails to send
  // must not throw into it, nor stop the records after it.
  const release = () => {
    const entries = pending ?? [];
    pending = null;
    stopListening();
    entries.forEach((entry) => {
      try {
        send(entry);
      } catch {
        // Dropped.
      }
    });
  };

  const check = () => {
    if (pending && isReady(store.getState())) release();
  };

  return {
    write: (level, record, message) => {
      if (disposed) return;
      if (!pending) {
        // A plugin's logger call must not fail because the app logger did.
        try {
          send({ level, record, message });
        } catch {
          // Dropped, as in release().
        }
        return;
      }
      pending.push({ level, record, message });
      if (!unsubscribe) unsubscribe = store.subscribe(check);
      check();
    },
    dispose: () => {
      disposed = true;
      pending = null;
      stopListening();
    },
  };
}
