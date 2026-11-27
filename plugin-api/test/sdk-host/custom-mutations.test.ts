import { act, render, renderHook, waitFor } from '@testing-library/react';
import { createElement, useEffect, useLayoutEffect } from 'react';
import { describe, expect, it } from 'vitest';
import {
  HOST_API_VERSION,
  type MobilePluginDefinition,
  type MobilePluginHost,
  type MutationTrigger,
} from '@mconf/bbb-mobile-plugin-api';
import { createPluginGraphqlState } from '../../../src/plugins/graphql-state';
import { createCustomSubscriptions } from '../../../src/plugins/custom-subscriptions';
import { MAX_MUTATION_VARIABLES_BYTES } from '../../../src/plugins/custom-mutations';
import { createPluginRegistry } from '../../../src/plugins/registry';
import type { HostLog, HostLogLevel, HostLogRecord } from '../../../src/plugins/log';
import { createFakeTransport } from './fake-transport';

const MUTATION = 'mutation SetHand($raiseHand: Boolean!) { userSetRaiseHand(raiseHand: $raiseHand) }';

interface Entry { level: HostLogLevel; record: HostLogRecord; message: string }

const setup = ({ connected = true } = {}) => {
  const entries: Entry[] = [];
  const log: HostLog = (level, record, message) => { entries.push({ level, record, message }); };
  const fake = createFakeTransport();
  const state = createPluginGraphqlState();
  state.setTransport(fake.transport);
  state.setConnected(connected);
  const hosts: MobilePluginHost[] = [];
  const definition = (name: string): MobilePluginDefinition => ({
    name,
    requiredHostApi: HOST_API_VERSION,
    create: (host) => { hosts.push(host); return {}; },
  });
  createPluginRegistry([definition('PluginA'), definition('PluginB')], {
    isBreakout: false,
    log,
    graphql: { state, subscriptions: createCustomSubscriptions(state, log) },
  });
  const records = (code: string) => entries.filter((e) => e.record.logCode === code);
  return { fake, state, entries, records, a: hosts[0], b: hosts[1] };
};

const use = (host: MobilePluginHost, mutation = MUTATION) => renderHook(
  (props: { mutation: string }) => host.useCustomMutation<{ raiseHand: unknown }>(props.mutation),
  { initialProps: { mutation } },
);

const send = async (trigger: MutationTrigger<{ raiseHand: unknown }> | null, raiseHand: unknown = true) => {
  if (!trigger) throw new Error('no trigger');
  await act(async () => { await trigger({ variables: { raiseHand } }); });
};

describe('plugin host: when a mutation can be sent', () => {
  it('has no trigger until the socket first opens, and keeps it after', () => {
    const { state, a } = setup({ connected: false });
    const view = use(a);
    expect(view.result.current[0]).toBeNull();
    act(() => state.setConnected(true));
    expect(view.result.current[0]).toBeTypeOf('function');
    act(() => state.setConnected(false));
    expect(view.result.current[0]).toBeTypeOf('function');
  });

  it('gives a hook that mounts while the socket is closed again a trigger', () => {
    const { state, a } = setup();
    act(() => state.setConnected(false));
    const view = use(a);
    expect(view.result.current[0]).toBeTypeOf('function');
  });

  it('drops the trigger when the App loses its GraphQL client, and sets it with the next', () => {
    const { fake, state, a } = setup();
    const view = use(a);
    act(() => state.setTransport(null));
    expect(view.result.current[0]).toBeNull();
    act(() => state.setTransport(fake.transport));
    expect(view.result.current[0]).toBeTypeOf('function');
  });

  it('has no trigger on the first render, before its hook is registered', () => {
    const { a } = setup();
    const triggers: unknown[] = [];
    renderHook(() => { triggers.push(a.useCustomMutation(MUTATION)[0]); });
    expect(triggers[0]).toBeNull();
    expect(triggers.at(-1)).toBeTypeOf('function');
  });

  it('sends a call made from a layout effect or from a child mount effect', async () => {
    const { fake, a } = setup();
    const Child = ({ trigger }: { trigger: MutationTrigger<{ raiseHand: boolean }> | null }) => {
      useEffect(() => { trigger?.({ variables: { raiseHand: true } }); }, [trigger]);
      return null;
    };
    const Part = () => {
      const [trigger] = a.useCustomMutation<{ raiseHand: boolean }>(MUTATION);
      useLayoutEffect(() => { trigger?.({ variables: { raiseHand: false } }); }, [trigger]);
      return createElement(Child, { trigger });
    };
    render(createElement(Part));
    await waitFor(() => expect(fake.sent).toHaveLength(2));
  });

  it('has no trigger before the app gives it a transport', () => {
    const { state, a } = setup();
    act(() => state.setTransport(null));
    const view = use(a);
    expect(view.result.current[0]).toBeNull();
  });

  it('fails a call made while the socket is closed at once, without sending it', async () => {
    const { fake, state, records, a } = setup();
    const view = use(a);
    act(() => state.setConnected(false));
    await send(view.result.current[0]);
    expect(fake.sent).toEqual([]);
    expect(view.result.current[1].loading).toBe(false);
    expect(view.result.current[1].error).toBeInstanceOf(Error);
    expect(records('plugin_host_mutation_failed')).toHaveLength(1);
  });

  it("drops a call through a kept trigger once the plugin's last hook with it unmounted", async () => {
    const { fake, records, a } = setup();
    const view = use(a);
    const kept = view.result.current[0];
    view.unmount();
    await send(kept);
    expect(fake.sent).toEqual([]);
    expect(records('plugin_host_mutation_dropped').map((e) => e.level)).toEqual(['debug']);
  });

  it('keeps the same trigger across renders and while it stays set', () => {
    const { state, a } = setup();
    const view = use(a);
    const first = view.result.current[0];
    view.rerender({ mutation: MUTATION });
    act(() => state.setConnected(false));
    act(() => state.setConnected(true));
    expect(view.result.current[0]).toBe(first);
  });
});

describe('plugin host: custom mutations', () => {
  it('sends the mutation and its variables, and resolves before the outcome is known', async () => {
    const { fake, a } = setup();
    fake.holdOutcomes();
    const view = use(a);
    await send(view.result.current[0]);
    expect(fake.sent).toEqual([{ mutation: MUTATION, variables: { raiseHand: true } }]);
    expect(view.result.current[1]).toEqual({ loading: true });
    await act(async () => { fake.release(); await Promise.resolve(); });
    expect(view.result.current[1]).toEqual({ loading: false });
  });

  it('logs a failure once at error level, with no variables, and shows it in the state', async () => {
    const { fake, records, a } = setup();
    const failure = new Error('Mutation failed (SetHand)');
    fake.failMutation(MUTATION, failure);
    const view = use(a);
    await send(view.result.current[0], 'w_secret');
    expect(view.result.current[1]).toEqual({ loading: false, error: failure });
    const failed = records('plugin_host_mutation_failed');
    expect(failed).toHaveLength(1);
    expect(failed[0].level).toBe('error');
    expect(failed[0].record.extraInfo).toMatchObject({ pluginName: 'PluginA', operationName: 'SetHand' });
    expect(JSON.stringify(failed)).not.toContain('w_secret');
  });

  it('fails a call whose variables are too large at once, without sending it', async () => {
    const { fake, records, a } = setup();
    const view = use(a);
    await send(view.result.current[0], 'x'.repeat(MAX_MUTATION_VARIABLES_BYTES));
    expect(fake.sent).toEqual([]);
    expect(view.result.current[1].loading).toBe(false);
    expect(view.result.current[1].error).toBeInstanceOf(Error);
    expect(records('plugin_host_mutation_failed')).toHaveLength(1);
  });

  it('measures the variables in UTF-8 bytes, as the app link does, and sends up to the limit', async () => {
    const { fake, a } = setup();
    const view = use(a);
    const overhead = JSON.stringify({ raiseHand: '' }).length;
    const room = MAX_MUTATION_VARIABLES_BYTES - overhead;
    await send(view.result.current[0], 'x'.repeat(room));
    await send(view.result.current[0], 'é'.repeat(room / 2));
    expect(fake.sent).toHaveLength(2);
    await send(view.result.current[0], `${'é'.repeat(room / 2)}x`);
    expect(fake.sent).toHaveLength(2);
    expect(view.result.current[1].error).toBeInstanceOf(Error);
  });

  it('fails a call when the transport throws, and still resolves', async () => {
    const { fake, a } = setup();
    fake.transport.mutate = () => { throw new Error('Syntax Error'); };
    const view = use(a);
    await send(view.result.current[0]);
    expect(view.result.current[1].error).toBeInstanceOf(Error);
  });

  it("shows only the last call's outcome, and logs an earlier call's failure", async () => {
    const { fake, records, a } = setup();
    fake.holdOutcomes();
    fake.failMutation(MUTATION, new Error('refused'));
    const view = use(a);
    await send(view.result.current[0]);
    fake.failMutation(MUTATION, undefined);
    await send(view.result.current[0]);
    // The later call ends first; the earlier one fails after it.
    await act(async () => { fake.release('newest-first'); await Promise.resolve(); });
    expect(view.result.current[1]).toEqual({ loading: false });
    expect(records('plugin_host_mutation_failed')).toHaveLength(1);
  });

  it("keeps each plugin's mutation state apart", async () => {
    const { fake, a, b } = setup();
    fake.failMutation(MUTATION, new Error('refused'));
    const mine = use(a);
    const theirs = use(b);
    await send(theirs.result.current[0]);
    expect(theirs.result.current[1].error).toBeInstanceOf(Error);
    expect(mine.result.current[1]).toEqual({ loading: false });
  });

  it('follows a change of the mutation text', async () => {
    const { fake, a } = setup();
    const other = 'mutation Away($raiseHand: Boolean!) { userSetAway(away: $raiseHand) }';
    fake.failMutation(other, new Error('refused'));
    const view = use(a);
    view.rerender({ mutation: other });
    await send(view.result.current[0]);
    expect(fake.sent.map((call) => call.mutation)).toEqual([other]);
    expect(view.result.current[1].error).toBeInstanceOf(Error);
  });
});
