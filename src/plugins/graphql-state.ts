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
  // Sends a mutation. It settles once the server accepted or refused it.
  mutate(mutation: string, variables: unknown): Promise<unknown>;
}

export interface PluginGraphqlSnapshot {
  readonly transport: PluginGraphqlTransport | null;
  // Whether the app's GraphQL socket is open, and whether it has been.
  readonly connected: boolean;
  readonly opened: boolean;
}

export interface PluginGraphqlState {
  get(): PluginGraphqlSnapshot;
  subscribe(listener: () => void): () => void;
  // Whether a mutation can be sent now.
  canSend(): boolean;
  // Whether mutation triggers are set: once the socket first opened, as on the web
  // client, until the App loses its client.
  triggersSet(): boolean;
  setTransport(transport: PluginGraphqlTransport | null): void;
  setConnected(connected: boolean): void;
}

// The App's GraphQL client and socket, as the plugin host sees them. The client
// exists only once the user joins, after the plugins were created, so the app sets
// it here when it has one.
export function createPluginGraphqlState(): PluginGraphqlState {
  let snapshot: PluginGraphqlSnapshot = Object.freeze({
    transport: null,
    connected: false,
    opened: false,
  });
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
    canSend: () => snapshot.transport !== null && snapshot.connected,
    setTransport: (transport) => update({ transport }),
    triggersSet: () => snapshot.transport !== null && snapshot.opened,
    setConnected: (connected) => update(connected ? { connected, opened: true } : { connected }),
  };
}
