import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import type { MutationState, MutationTrigger } from '@mconf/bbb-mobile-plugin-api';
import type { PluginGraphqlState } from './graphql-state';
import { errorInfo, type HostLog } from './log';
import { operationName } from './custom-subscriptions';

// The app's GraphQL link drops a mutation whose variables are larger than this, and
// Apollo then never settles the call (use-join-meeting.js). The host fails it instead.
export const MAX_MUTATION_VARIABLES_BYTES = 10485760;

const IDLE: MutationState = Object.freeze({ loading: false });
const SENDING: MutationState = Object.freeze({ loading: true });

// UTF-8 bytes, as the app's link measures them.
const utf8Length = (text: string): number => text
  .replace(/[\ud800-\udbff][\udc00-\udfff]/g, 'xxxx')
  .replace(/[\u0800-\uffff]/g, 'xxx')
  .replace(/[\u0080-\u07ff]/g, 'xx')
  .length;

interface Slot {
  state: MutationState;
  lastCall: number;
  hooks: number;
}

// One plugin's mutations. The hooks with the same mutation text share its state;
// other plugins have their own.
export function createCustomMutations(
  pluginName: string,
  graphql: PluginGraphqlState,
  log: HostLog,
) {
  const slots = new Map<string, Slot>();
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  };
  let calls = 0;

  const info = (mutation: string) => ({ pluginName, operationName: operationName(mutation) });
  const drop = (mutation: string, reason: string) => {
    log('debug', { logCode: 'plugin_host_mutation_dropped', extraInfo: { ...info(mutation), reason } }, `Plugin ${pluginName}: mutation dropped: ${reason}`);
  };
  // Only the plugin's last call of a mutation sets its state, and not after a reset.
  const settle = (mutation: string, call: number, state: MutationState) => {
    const slot = slots.get(mutation);
    if (!slot || slot.lastCall !== call) return;
    slot.state = state;
    notify();
  };

  const send = (mutation: string, variables: unknown) => {
    const slot = slots.get(mutation);
    if (!slot) {
      drop(mutation, 'no hook with this mutation is mounted');
      return;
    }
    calls += 1;
    const call = calls;
    slot.lastCall = call;
    slot.state = SENDING;
    notify();
    let outcome: Promise<unknown>;
    try {
      // graphql-ws would hold a call made while the socket is closed, and send it after
      // the reconnect. The contract keeps no call for later.
      const { transport } = graphql.get();
      if (!transport || !graphql.canSend()) {
        throw new Error('The GraphQL socket is closed; the mutation was not sent');
      }
      const bytes = utf8Length(JSON.stringify(variables) ?? '');
      if (bytes > MAX_MUTATION_VARIABLES_BYTES) {
        throw new Error(`The mutation's variables are ${bytes} bytes; at most ${MAX_MUTATION_VARIABLES_BYTES} can be sent`);
      }
      outcome = transport.mutate(mutation, variables);
    } catch (error) {
      outcome = Promise.reject(error);
    }
    outcome.then(
      () => settle(mutation, call, IDLE),
      (error) => {
        log('error', { logCode: 'plugin_host_mutation_failed', extraInfo: { ...info(mutation), ...errorInfo(error) } }, `Plugin ${pluginName}: mutation failed`);
        settle(mutation, call, Object.freeze({ loading: false, error }));
      },
    );
  };

  const useCustomMutation = <V>(mutation: string): [MutationTrigger<V> | null, MutationState] => {
    const triggersSet = useSyncExternalStore(graphql.subscribe, graphql.triggersSet);
    const state = useSyncExternalStore(subscribe, () => slots.get(mutation)?.state ?? IDLE);
    // The mutation this hook has registered. Until its effect ran, a call would find
    // no hook with the mutation and be dropped, so there is no trigger yet.
    const [registered, setRegistered] = useState<string | null>(null);

    useEffect(() => {
      let slot = slots.get(mutation);
      if (!slot) {
        slot = { state: IDLE, lastCall: 0, hooks: 0 };
        slots.set(mutation, slot);
      }
      slot.hooks += 1;
      setRegistered(mutation);
      const mine = slot;
      return () => {
        mine.hooks -= 1;
        if (mine.hooks > 0 || slots.get(mutation) !== mine) return;
        // The state goes with the last hook, and a call still in flight no longer sets it.
        slots.delete(mutation);
        notify();
      };
    }, [mutation]);

    // The trigger resolves once the host sent the call or failed it, and never rejects.
    const trigger = useMemo<MutationTrigger<V>>(
      () => async ({ variables }) => { send(mutation, variables); },
      [mutation],
    );
    return [registered === mutation && triggersSet ? trigger : null, state];
  };

  return { useCustomMutation };
}
