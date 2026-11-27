import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  HOST_API_VERSION,
  type GraphqlResult,
  type MobilePluginDefinition,
  type MobilePluginHost,
} from '@mconf/bbb-mobile-plugin-api';
import { createPluginGraphqlState } from '../../../src/plugins/graphql-state';
import { createCustomSubscriptions, subscriptionKey } from '../../../src/plugins/custom-subscriptions';
import { createPluginRegistry } from '../../../src/plugins/registry';
import type { HostLog, HostLogLevel, HostLogRecord } from '../../../src/plugins/log';
import { createFakeTransport } from './fake-transport';

const QUERY = 'subscription Users { user { userId } }';
const OTHER = 'subscription Groups { group { id } }';

interface Entry { level: HostLogLevel; record: HostLogRecord }

// An App with two plugins on one transport, as the app wires them.
const setup = ({ attach = true } = {}) => {
  const entries: Entry[] = [];
  const log: HostLog = (level, record) => { entries.push({ level, record }); };
  const fake = createFakeTransport();
  const state = createPluginGraphqlState();
  if (attach) state.setTransport(fake.transport);
  const subscriptions = createCustomSubscriptions(state, log);
  const hosts: MobilePluginHost[] = [];
  const definition = (name: string): MobilePluginDefinition => ({
    name,
    requiredHostApi: HOST_API_VERSION,
    create: (host) => { hosts.push(host); return {}; },
  });
  createPluginRegistry([definition('PluginA'), definition('PluginB')], {
    isBreakout: false,
    log,
    graphql: { state, subscriptions },
  });
  return { fake, state, entries, a: hosts[0], b: hosts[1] };
};

const watch = (host: MobilePluginHost, query = QUERY, variables?: Record<string, unknown>) => {
  const seen: GraphqlResult<unknown>[] = [];
  const view = renderHook((props: { query: string; variables?: Record<string, unknown> }) => {
    const result = host.useCustomSubscription(props.query, { variables: props.variables });
    seen.push(result);
    return result;
  }, { initialProps: { query, variables } });
  return { ...view, seen };
};

describe('plugin host: subscription key', () => {
  it('compares the query by its exact text', () => {
    expect(subscriptionKey(QUERY, undefined)).toBe(subscriptionKey(QUERY, undefined));
    expect(subscriptionKey(QUERY, undefined)).not.toBe(subscriptionKey(`${QUERY} `, undefined));
  });

  it('sorts the top-level keys of the variables, and only those', () => {
    expect(subscriptionKey(QUERY, { a: 1, b: 2 })).toBe(subscriptionKey(QUERY, { b: 2, a: 1 }));
    expect(subscriptionKey(QUERY, { a: { x: 1, y: 2 } })).not.toBe(subscriptionKey(QUERY, { a: { y: 2, x: 1 } }));
  });

  it('keeps no variables apart from empty ones', () => {
    expect(subscriptionKey(QUERY, undefined)).not.toBe(subscriptionKey(QUERY, {}));
  });
});

describe('plugin host: custom subscriptions', () => {
  it('is loading until the first data, then shows it', () => {
    const { fake, a } = setup();
    const view = watch(a);
    expect(view.result.current).toEqual({ loading: true });
    act(() => fake.push(QUERY, undefined, { loading: false, data: { user: [] } }));
    expect(view.result.current).toEqual({ loading: false, data: { user: [] } });
  });

  it('shares one server subscription among hooks, also across plugins', () => {
    const { fake, a, b } = setup();
    const first = watch(a);
    const second = watch(b);
    expect(fake.subscriptionCount(QUERY)).toBe(1);
    act(() => fake.push(QUERY, undefined, { loading: false, data: 1 }));
    expect(first.result.current.data).toBe(1);
    expect(second.result.current.data).toBe(1);
  });

  it('ends the server subscription when its last hook unmounts', () => {
    const { fake, a, b } = setup();
    const first = watch(a);
    const second = watch(b);
    first.unmount();
    expect(fake.unsubscribed).toEqual([]);
    second.unmount();
    expect(fake.unsubscribed).toEqual([QUERY]);
  });

  it('gives a hook that mounts later the current data on its first render', () => {
    const { fake, a, b } = setup();
    watch(a);
    act(() => fake.push(QUERY, undefined, { loading: false, data: 1 }));
    const late = watch(b);
    expect(late.seen[0]).toEqual({ loading: false, data: 1 });
  });

  it('subscribes once the app gives it a transport', () => {
    const { fake, state, a } = setup({ attach: false });
    const view = watch(a);
    expect(view.result.current).toEqual({ loading: true });
    act(() => state.setTransport(fake.transport));
    expect(fake.subscriptionCount(QUERY)).toBe(1);
    act(() => fake.push(QUERY, undefined, { loading: false, data: 1 }));
    expect(view.result.current.data).toBe(1);
  });

  it('shows an error with the last data, logs it once, and does not throw', () => {
    const { fake, entries, a, b } = setup();
    const first = watch(a);
    const second = watch(b);
    act(() => fake.push(QUERY, undefined, { loading: false, data: 1 }));
    const failure = new Error('validation-failed');
    act(() => fake.push(QUERY, undefined, { loading: false, error: failure }));
    expect(first.result.current).toEqual({ loading: false, data: 1, error: failure });
    expect(second.result.current).toEqual({ loading: false, data: 1, error: failure });
    const failed = entries.filter((e) => e.record.logCode === 'plugin_host_subscription_failed');
    expect(failed).toHaveLength(1);
    expect(failed[0].level).toBe('warn');
    expect(failed[0].record.extraInfo).toMatchObject({ operationName: 'Users', plugins: ['PluginA', 'PluginB'] });
  });

  it('shows an error when the transport refuses the query', () => {
    const { fake, entries, a } = setup();
    fake.failSubscribe(new Error('Syntax Error'));
    const view = watch(a);
    expect(view.result.current.loading).toBe(false);
    expect(view.result.current.error).toBeInstanceOf(Error);
    expect(entries.filter((e) => e.record.logCode === 'plugin_host_subscription_failed')).toHaveLength(1);
  });

  it('keeps the variables out of its records', () => {
    const { fake, entries, a } = setup();
    watch(a, QUERY, { userId: 'w_secret' });
    act(() => fake.push(QUERY, { userId: 'w_secret' }, { loading: false, error: new Error('x') }));
    expect(JSON.stringify(entries)).not.toContain('w_secret');
  });

  it('goes from the previous result to loading to the new data when its arguments change', () => {
    const { fake, a } = setup();
    const view = watch(a, QUERY, { id: 1 });
    act(() => fake.push(QUERY, { id: 1 }, { loading: false, data: 'one' }));
    const before = view.seen.length;
    view.rerender({ query: QUERY, variables: { id: 2 } });
    expect(view.seen[before]).toEqual({ loading: false, data: 'one' });
    expect(view.result.current).toEqual({ loading: true });
    act(() => fake.push(QUERY, { id: 2 }, { loading: false, data: 'two' }));
    expect(view.result.current).toEqual({ loading: false, data: 'two' });
  });

  it('goes straight to the new data when another hook holds the new arguments', () => {
    const { fake, a, b } = setup();
    watch(b, OTHER);
    act(() => fake.push(OTHER, undefined, { loading: false, data: 'other' }));
    const view = watch(a, QUERY);
    act(() => fake.push(QUERY, undefined, { loading: false, data: 'mine' }));
    const before = view.seen.length;
    view.rerender({ query: OTHER, variables: undefined });
    expect(view.seen.slice(before).every((r) => !r.loading)).toBe(true);
    expect(view.result.current).toEqual({ loading: false, data: 'other' });
  });

  it('ends the previous server subscription after an argument change', () => {
    const { fake, a } = setup();
    const view = watch(a, QUERY, { id: 1 });
    view.rerender({ query: QUERY, variables: { id: 2 } });
    expect(fake.unsubscribed).toEqual([QUERY]);
    expect(fake.subscriptionCount(QUERY)).toBe(2);
  });

  it('takes null variables without throwing', () => {
    const { fake, a } = setup();
    const view = watch(a, QUERY, null as unknown as Record<string, unknown>);
    expect(view.result.current).toEqual({ loading: true });
    expect(fake.subscriptionCount(QUERY)).toBe(1);
  });

  it('does not subscribe again for new but equal variables', () => {
    const { fake, a } = setup();
    const view = watch(a, QUERY, { a: 1, b: 2 });
    view.rerender({ query: QUERY, variables: { b: 2, a: 1 } });
    expect(fake.subscriptionCount(QUERY)).toBe(1);
  });
});
