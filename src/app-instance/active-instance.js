// A stack of the mounted App instances, innermost (most recently mounted) last.
//
// The "active" instance is the one that currently owns media: while a breakout
// is open the main room is suspended (see mainRoomBlockedByBreakout), so the
// nested App is active; when it unmounts the main App becomes active again.
//
// This exists ONLY for legacy, non-React code that cannot receive the instance
// by constructor or context: the legacy `store` shim (src/store/redux/legacy-store.js),
// the logger's auth-info fetcher and the DDP socket-connection modules. New code
// must use `useAppInstance()` or constructor injection instead.
const stack = [];
const listeners = new Set();

const notify = () => {
  listeners.forEach((listener) => {
    try {
      listener(getActiveInstanceOrNull());
    } catch (e) {
      // listeners must never break mount/unmount
    }
  });
};

export const getActiveInstanceOrNull = () => (
  stack.length > 0 ? stack[stack.length - 1] : null
);

export const hasActiveInstance = () => stack.length > 0;

export const getActiveInstance = () => {
  const instance = getActiveInstanceOrNull();

  if (!instance) throw new Error('No active AppInstance');

  return instance;
};

export const isActiveInstance = (instance) => getActiveInstanceOrNull() === instance;

export const pushActiveInstance = (instance) => {
  stack.push(instance);
  notify();
};

export const popActiveInstance = (instance) => {
  const index = stack.lastIndexOf(instance);

  if (index !== -1) stack.splice(index, 1);

  notify();
};

// Called with the new active instance (or null) whenever it changes.
export const onActiveInstanceChange = (listener) => {
  listeners.add(listener);

  return () => listeners.delete(listener);
};
