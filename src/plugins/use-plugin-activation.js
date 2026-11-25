import { gql, useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { useAppInstance } from '../app-instance/context';
import { selectActivePlugins } from './activation';

// The meeting's plugin list: the server's `plugin` view, written when the meeting
// is created. Read only after the join. Before it, the GraphQL middleware holds
// every operation that is not on its short not-in-meeting list.
const MEETING_PLUGINS = gql`
  query MeetingPlugins {
    plugin {
      name
      loadFailureReason
      loadFailureSource
    }
  }
`;

// Reads the meeting's plugin list once per App mount and settles which plugins
// are active (activation.ts).
const usePluginActivation = () => {
  const instance = useAppInstance();
  const { plugins, pluginActivation } = instance;
  const skip = plugins.length === 0 || pluginActivation.get().settled;
  const { data, error, loading } = useQuery(MEETING_PLUGINS, {
    skip,
    fetchPolicy: 'no-cache',
  });

  useEffect(() => {
    if (skip || loading) return;
    pluginActivation.settle(() => selectActivePlugins(
      plugins,
      error ? { kind: 'error', error } : { kind: 'data', data },
      instance.getMeetingSettings(),
      instance.pluginHostLog.write,
    ));
  }, [skip, loading, data, error, instance, plugins, pluginActivation]);
};

export default usePluginActivation;
