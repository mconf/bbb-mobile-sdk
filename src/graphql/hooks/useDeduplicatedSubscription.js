import { useEffect, useState } from 'react';
import { makeVar, useApolloClient, useReactiveVar } from '@apollo/client';

// Apollo does not deduplicate subscriptions: every hook instance opens its own
// operation on the socket. Keyed by client first, since a breakout room mounts a
// second instance of this app with its own ApolloClient.
const subscriptions = new WeakMap();

const PENDING = makeVar({ data: null, loading: true, error: null });

const bucketFor = (client, document) => {
  let byDocument = subscriptions.get(client);

  if (!byDocument) {
    byDocument = new Map();
    subscriptions.set(client, byDocument);
  }

  let byVariables = byDocument.get(document);

  if (!byVariables) {
    byVariables = new Map();
    byDocument.set(document, byVariables);
  }

  return byVariables;
};

const acquire = (client, document, variables, variablesKey) => {
  const byVariables = bucketFor(client, document);
  const existing = byVariables.get(variablesKey);

  if (existing) {
    existing.count += 1;
    return existing;
  }

  const result = makeVar({ data: null, loading: true, error: null });
  const entry = { count: 1, result, subscription: null };

  byVariables.set(variablesKey, entry);
  entry.subscription = client.subscribe({ query: document, variables }).subscribe({
    next: ({ data }) => result({ data: data ?? null, loading: false, error: null }),
    error: (error) => result({ ...result(), loading: false, error }),
  });

  return entry;
};

const release = (client, document, variablesKey) => {
  const byVariables = subscriptions.get(client)?.get(document);
  const entry = byVariables?.get(variablesKey);

  if (!entry) {
    return;
  }

  entry.count -= 1;

  if (entry.count > 0) {
    return;
  }

  entry.subscription?.unsubscribe();
  byVariables.delete(variablesKey);
};

const useDeduplicatedSubscription = (document, options) => {
  const client = useApolloClient();
  const { variables, skip = false } = options ?? {};
  const variablesKey = JSON.stringify(variables ?? null);
  // A reactive var is a function, so every setter needs the lazy form or React
  // takes it for an updater.
  const [result, setResult] = useState(() => PENDING);

  useEffect(() => {
    if (skip) {
      setResult(() => PENDING);
      return undefined;
    }

    setResult(() => acquire(client, document, variables, variablesKey).result);

    return () => release(client, document, variablesKey);
  }, [client, document, variablesKey, skip]);

  return useReactiveVar(result);
};

export default useDeduplicatedSubscription;
