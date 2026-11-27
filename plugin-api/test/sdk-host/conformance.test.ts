import { HOST_API_VERSION, definePlugin, type MobilePluginHost } from '@mconf/bbb-mobile-plugin-api';
import { createPluginRegistry } from '../../../src/plugins/registry';
import { createPluginGraphqlState } from '../../../src/plugins/graphql-state';
import { createCustomSubscriptions } from '../../../src/plugins/custom-subscriptions';
import type { HostLog, HostLogLevel } from '../../../src/plugins/log';
import { createFakeTransport } from './fake-transport';
import {
  describeHostConformance,
  describeLoaderConformance,
  type HostHarness,
  type LoaderHarness,
} from '../conformance/suite';

// The conformance cases against the app's plugin host (see registry.test.ts). It runs
// only the groups whose members the host provides; the other members throw.

const recorder = () => {
  const levels: HostLogLevel[] = [];
  const log: HostLog = (level) => { levels.push(level); };
  return { log, count: (...wanted: HostLogLevel[]) => levels.filter((l) => wanted.includes(l)).length };
};

const unsupported = (what: string) => (): never => {
  throw new Error(`the SDK host harness does not support ${what} yet`);
};

describeHostConformance('SDK host', (): HostHarness => {
  const { log, count } = recorder();
  // Two plugins of one App on a fake transport, connected.
  const fake = createFakeTransport();
  const state = createPluginGraphqlState();
  state.setTransport(fake.transport);
  state.setConnected(true);
  const hosts = new Map<string, MobilePluginHost>();
  const plugin = (name: string) => definePlugin({
    name,
    requiredHostApi: HOST_API_VERSION,
    create: (h) => { hosts.set(name, h); return {}; },
  });
  createPluginRegistry([plugin('ConformancePlugin'), plugin('OtherPlugin')], {
    isBreakout: false,
    log,
    graphql: { state, subscriptions: createCustomSubscriptions(state, log) },
  });
  const host = hosts.get('ConformancePlugin');
  const other = hosts.get('OtherPlugin');
  if (!host || !other) throw new Error('the SDK host did not create the plugins');
  return {
    host,
    setLocale: unsupported('setLocale'),
    failMutation: (mutation, error) => fake.failMutation(mutation, error),
    errorLogCount: () => count('error'),
    dialogIds: unsupported('dialogIds'),
    pressDialogAction: unsupported('pressDialogAction'),
    setSubscriptionResult: (query, variables, result) => fake.push(query, variables, result),
    subscriptionCount: (query) => fake.subscriptionCount(query),
    // The socket opened before the case starts, so only the client can be missing.
    setCanSend: (canSend) => state.setTransport(canSend ? fake.transport : null),
    otherPluginHost: () => other,
  };
}, ['identity', 'logger', 'custom subscription', 'custom mutation']);

describeLoaderConformance('SDK host', (): LoaderHarness => {
  const { log, count } = recorder();
  return {
    load: (definitions) => createPluginRegistry(definitions, { isBreakout: false, log }).map((p) => p.name),
    problemLogCount: () => count('warn', 'error'),
  };
});
