import type { GraphqlResult } from '@mconf/bbb-mobile-plugin-api';
import type { PluginGraphqlTransport } from '../../../src/plugins/graphql-state';
import { subscriptionKey } from '../../../src/plugins/custom-subscriptions';

interface Watcher {
  query: string;
  key: string;
  next(data: unknown): void;
  error(error: unknown): void;
}

// A transport for the host's tests: it records what the host subscribes to, and the
// test decides every result.
export const createFakeTransport = () => {
  const watchers = new Set<Watcher>();
  const subscribed: { query: string; variables: unknown }[] = [];
  const unsubscribed: string[] = [];
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
  };

  return {
    transport,
    subscribed,
    unsubscribed,
    subscriptionCount: (query: string) => subscribed.filter((entry) => entry.query === query).length,
    // Sends a result to every watcher of this query and these variables.
    push(query: string, variables: Record<string, unknown> | undefined, result: GraphqlResult<unknown>) {
      const key = subscriptionKey(query, variables);
      [...watchers].filter((w) => w.key === key).forEach((w) => {
        if (result.error !== undefined) w.error(result.error);
        else w.next(result.data);
      });
    },
    failSubscribe(error: unknown) { throwOnSubscribe = error; },
  };
};
