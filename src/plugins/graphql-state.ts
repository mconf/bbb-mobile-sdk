// What the host needs from the app's GraphQL client. The app's adapter
// (use-plugin-graphql.js) builds it on Apollo.
export interface PluginGraphqlTransport {
  // Starts a subscription; the returned function ends it. A query that cannot be
  // sent may throw.
  subscribe(
    query: string,
    variables: Record<string, unknown> | undefined,
    observer: { next(data: unknown): void; error(error: unknown): void },
  ): () => void;
}

export interface PluginGraphqlSnapshot {
  readonly transport: PluginGraphqlTransport | null;
}

export interface PluginGraphqlState {
  get(): PluginGraphqlSnapshot;
  subscribe(listener: () => void): () => void;
  setTransport(transport: PluginGraphqlTransport | null): void;
}

// The App's GraphQL client, as the plugin host sees it. The client
// exists only once the user joins, after the plugins were created, so the app sets
// it here when it has one.
export function createPluginGraphqlState(): PluginGraphqlState {
  let snapshot: PluginGraphqlSnapshot = Object.freeze({ transport: null });
  const listeners = new Set<() => void>();
  const update = (next: Partial<PluginGraphqlSnapshot>) => {
    const changed = Object.entries(next).some(
      ([key, value]) => snapshot[key as keyof PluginGraphqlSnapshot] !== value,
    );
    if (!changed) return;
    snapshot = Object.freeze({ ...snapshot, ...next });
    listeners.forEach((listener) => listener());
  };

  return {
    get: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    setTransport: (transport) => update({ transport }),
  };
}
