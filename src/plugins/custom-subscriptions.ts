import { useEffect, useState, useSyncExternalStore } from 'react';
import type { GraphqlResult } from '@mconf/bbb-mobile-plugin-api';
import type { PluginGraphqlState } from './graphql-state';
import { errorInfo, type HostLog } from './log';

const LOADING: GraphqlResult<never> = Object.freeze({ loading: true });

// The contract compares variables by their JSON with the top-level keys sorted, and
// keeps no variables apart from empty ones.
const variablesJson = (variables: unknown): string => {
  if (variables === undefined) return 'undefined';
  if (variables === null || typeof variables !== 'object') return JSON.stringify(variables);
  return JSON.stringify(Object.fromEntries(
    Object.entries(variables).sort(([a], [b]) => (a < b ? -1 : Number(a > b))),
  ));
};

export const subscriptionKey = (
  query: string,
  variables: Record<string, unknown> | undefined,
): string => JSON.stringify([query, variablesJson(variables)]);

export const operationName = (document: string): string | undefined => (
  document.match(/^\s*(?:query|subscription|mutation)\s+([_A-Za-z][_0-9A-Za-z]*)/) ?? []
)[1];

interface Entry {
  readonly key: string;
  readonly query: string;
  readonly variables: Record<string, unknown> | undefined;
  result: GraphqlResult<unknown>;
  // How many hooks of each plugin hold it.
  readonly holders: Map<string, number>;
  started: boolean;
  end: (() => void) | null;
}

export interface CustomSubscriptions {
  // The useCustomSubscription member of one plugin's host.
  hookFor(pluginName: string): <T>(
    query: string,
    options?: { variables?: Record<string, unknown> },
  ) => GraphqlResult<T>;
}

// The plugins' subscriptions in one App. Hooks with the same query and variables share
// one server subscription, across plugins.
export function createCustomSubscriptions(
  graphql: PluginGraphqlState,
  log: HostLog,
): CustomSubscriptions {
  const entries = new Map<string, Entry>();
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  };
  const current = (entry: Entry) => entries.get(entry.key) === entry;

  // An error ends the subscription, and it is not started again. The hook keeps the
  // last data, so a plugin does not act on an empty list the meeting does not have.
  const fail = (entry: Entry, error: unknown) => {
    const { data } = entry.result;
    entry.result = Object.freeze(
      data === undefined ? { loading: false, error } : { loading: false, data, error },
    );
    const name = operationName(entry.query);
    log('warn', {
      logCode: 'plugin_host_subscription_failed',
      extraInfo: { operationName: name, plugins: [...entry.holders.keys()], ...errorInfo(error) },
    }, `Plugin subscription ${name ?? '(unnamed)'} failed`);
    notify();
  };

  const start = (entry: Entry) => {
    const { transport } = graphql.get();
    if (!transport || entry.started) return;
    entry.started = true;
    try {
      entry.end = transport.subscribe(entry.query, entry.variables, {
        next: (data) => {
          if (!current(entry)) return;
          entry.result = Object.freeze({ loading: false, data });
          notify();
        },
        error: (error) => { if (current(entry)) fail(entry, error); },
      });
    } catch (error) {
      fail(entry, error);
    }
  };
  // Hooks can mount before the app has a client; their subscriptions start with it.
  graphql.subscribe(() => entries.forEach(start));

  const acquire = (
    key: string,
    query: string,
    variables: Record<string, unknown> | undefined,
    pluginName: string,
  ): Entry => {
    let entry = entries.get(key);
    if (!entry) {
      entry = {
        key, query, variables, result: LOADING, holders: new Map(), started: false, end: null,
      };
      entries.set(key, entry);
    }
    entry.holders.set(pluginName, (entry.holders.get(pluginName) ?? 0) + 1);
    start(entry);
    return entry;
  };

  const release = (entry: Entry, pluginName: string) => {
    const count = (entry.holders.get(pluginName) ?? 1) - 1;
    if (count > 0) entry.holders.set(pluginName, count);
    else entry.holders.delete(pluginName);
    if (entry.holders.size > 0) return;
    if (current(entry)) entries.delete(entry.key);
    entry.end?.();
  };

  return {
    hookFor: (pluginName) => <T>(
      query: string,
      options?: { variables?: Record<string, unknown> },
    ): GraphqlResult<T> => {
      const variables = options?.variables;
      const key = subscriptionKey(query, variables);
      const [held, setHeld] = useState<Entry | null>(null);

      useEffect(() => {
        const entry = acquire(key, query, variables, pluginName);
        setHeld(entry);
        return () => release(entry, pluginName);
        // `key` stands for the query and the variables.
      }, [key]);

      // Until the effect holds the new arguments, the hook shows what it held before.
      // A first render shows what another hook already holds.
      const snapshot = (): GraphqlResult<unknown> => {
        if (held?.key === key) return held.result;
        return held?.result ?? entries.get(key)?.result ?? LOADING;
      };
      return useSyncExternalStore(subscribe, snapshot) as GraphqlResult<T>;
    },
  };
}
