import { useCallback, useState } from 'react';
import type { MobilePluginHost, MutationState, MutationTrigger } from '../src/index.js';
import { createMockHost } from '../src/testing/index.js';
import { describeHostConformance } from './conformance/suite.js';

// A host that learns of a mutation failure only after the trigger resolved, as a host
// does when the transport or the server reports it. The rest is the mock host.
describeHostConformance('host that reports a failure after the send', () => {
  const { host, controller } = createMockHost();
  const failures = new Map<string, unknown>();
  const lateHost: MobilePluginHost = {
    ...host,
    useCustomMutation: <V>(mutation: string) => {
      const [state, setState] = useState<MutationState>({ loading: false });
      const trigger = useCallback<MutationTrigger<V>>(async () => {
        setState({ loading: true });
        const error = failures.get(mutation);
        // Not 0: a zero-delay timer can fire before act returns, and the case would then pass
        // without waitFor.
        setTimeout(() => {
          if (error === undefined) {
            setState({ loading: false });
          } else {
            setState({ loading: false, error });
            host.logger.error({ logCode: 'late_host_mutation_failed' }, 'Mutation failed');
          }
        }, 20);
      }, [mutation]);
      return [trigger, state];
    },
  };
  return {
    host: lateHost,
    setLocale: (locale) => controller.setLocale(locale),
    failMutation: (mutation, error) => { failures.set(mutation, error); },
    errorLogCount: () => controller.logs.filter((entry) => entry.level === 'error').length,
    dialogIds: () => controller.dialogs.map((entry) => entry.dialog.id),
    pressDialogAction: (id, actionIndex) => controller.pressDialogAction(id, actionIndex),
  };
});
