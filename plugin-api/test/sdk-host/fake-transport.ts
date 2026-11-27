import type { GraphqlResult } from '@mconf/bbb-mobile-plugin-api';
import type { PluginGraphqlTransport } from '../../../src/plugins/graphql-state';
import { subscriptionKey } from '../../../src/plugins/custom-subscriptions';

interface Watcher {
  query: string;
  key: string;
  next(data: unknown): void;
  error(error: unknown): void;
}

// A transport for the host's tests: it records what the host subscribes to and sends,
// and the test decides every result.
export const createFakeTransport = () => {
  const watchers = new Set<Watcher>();
  const subscribed: { query: string; variables: unknown }[] = [];
  const unsubscribed: string[] = [];
  const sent: { mutation: string; variables: unknown }[] = [];
  const failures = new Map<string, unknown>();
  const pending: { mutation: string; settle(): void }[] = [];
  let holdOutcomes = false;
  let throwOnSubscribe: unknown;

  const transport: PluginGraphqlTransport = {
    subscribe(query, variables, observer) {
      if (throwOnSubscribe !== undefined) throw throwOnSubscribe;
      subscribed.push({ query, variables });
      const watcher: Watcher = { query, key: subscriptionKey(query, variables), ...observer };
      watchers.add(watcher);
      return () => {
        watchers.delete(watcher);
        unsubscribed.push(query);
      };
    },
    mutate(mutation, variables) {
      sent.push({ mutation, variables });
      const failure = failures.get(mutation);
      return new Promise<unknown>((resolve, reject) => {
        const settle = (error?: unknown) => (error === undefined ? resolve({}) : reject(error));
        if (holdOutcomes) pending.push({ mutation, settle: () => settle(failure) });
        else Promise.resolve().then(() => settle(failure));
      });
    },
  };

  return {
    transport,
    subscribed,
    unsubscribed,
    sent,
    subscriptionCount: (query: string) => subscribed.filter((entry) => entry.query === query).length,
    // Sends a result to every watcher of this query and these variables.
    push(query: string, variables: Record<string, unknown> | undefined, result: GraphqlResult<unknown>) {
      const key = subscriptionKey(query, variables);
      [...watchers].filter((w) => w.key === key).forEach((w) => {
        if (result.error !== undefined) w.error(result.error);
        else w.next(result.data);
      });
    },
    failMutation(mutation: string, error: unknown) {
      if (error === undefined) failures.delete(mutation);
      else failures.set(mutation, error);
    },
    // Keeps mutation outcomes until release() is called, to test what happens meanwhile.
    holdOutcomes() { holdOutcomes = true; },
    // Settles the kept calls, oldest first, or newest first.
    release(order: 'oldest-first' | 'newest-first' = 'oldest-first') {
      holdOutcomes = false;
      const calls = pending.splice(0);
      (order === 'oldest-first' ? calls : calls.reverse()).forEach((call) => call.settle());
    },
    failSubscribe(error: unknown) { throwOnSubscribe = error; },
  };
};
