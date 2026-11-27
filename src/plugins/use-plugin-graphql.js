import { gql, useApolloClient } from '@apollo/client';
import { useLayoutEffect } from 'react';
import { useAppInstance } from '../app-instance/context';
import { withoutPatchedNames } from './patched-names';

// The plugins' GraphQL transport (graphql-state.ts) on this App's Apollo client.
// Plugin operations skip Apollo's cache. On the web client only subscriptions do, but
// the host reads no mutation result. gql() throws on a document that does not parse;
// the host turns that into a failed subscription or call.
const createApolloTransport = (client) => ({
  subscribe: (query, variables, observer) => {
    const subscription = client
      .subscribe({ query: withoutPatchedNames(gql(query)), variables, fetchPolicy: 'no-cache' })
      .subscribe({
        next: ({ data }) => observer.next(data),
        error: (error) => observer.error(error),
      });
    return () => subscription.unsubscribe();
  },
  mutate: (mutation, variables) => client.mutate({
    mutation: gql(mutation),
    variables,
    fetchPolicy: 'no-cache',
  }),
});

// Gives the plugin host this App's Apollo client, which exists only once the user
// joined.
const usePluginGraphql = () => {
  const { pluginGraphql } = useAppInstance();
  const client = useApolloClient();

  useLayoutEffect(() => {
    pluginGraphql.setTransport(createApolloTransport(client));
    return () => pluginGraphql.setTransport(null);
  }, [pluginGraphql, client]);
};

export default usePluginGraphql;
