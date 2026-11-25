import { EMPTY_REGISTRY, type PluginRegistry } from './registry';

export interface PluginActivation {
  // True once the meeting's plugin list was read or failed. It stays false with
  // no plugins, since nothing is read then.
  readonly settled: boolean;
  readonly active: PluginRegistry;
}

export interface PluginActivationState {
  get(): PluginActivation;
  subscribe(listener: () => void): () => void;
  // Runs `compute` and keeps its result, the first time only.
  settle(compute: () => PluginRegistry): void;
}

const PENDING: PluginActivation = Object.freeze({ settled: false, active: EMPTY_REGISTRY });

// Which plugins are active in one App mount. It settles once: the server never
// changes a meeting's plugin list. A failed read is not retried, so no plugin
// runs in that mount. The snapshot changes only when it settles, as
// useSyncExternalStore requires.
export function createPluginActivationState(): PluginActivationState {
  let snapshot = PENDING;
  const listeners = new Set<() => void>();

  return {
    get: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    settle(compute) {
      if (snapshot.settled) return;
      snapshot = Object.freeze({ settled: true, active: compute() });
      listeners.forEach((listener) => listener());
    },
  };
}
