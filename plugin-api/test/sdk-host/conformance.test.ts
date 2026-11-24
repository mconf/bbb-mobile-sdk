import { HOST_API_VERSION, definePlugin, type MobilePluginHost } from '@mconf/bbb-mobile-plugin-api';
import { createPluginRegistry } from '../../../src/plugins/registry';
import type { HostLog, HostLogLevel } from '../../../src/plugins/log';
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
  let host: MobilePluginHost | undefined;
  createPluginRegistry([definePlugin({
    name: 'ConformancePlugin',
    requiredHostApi: HOST_API_VERSION,
    create: (h) => { host = h; return {}; },
  })], { isBreakout: false, log });
  if (!host) throw new Error('the SDK host did not create the plugin');
  return {
    host,
    setLocale: unsupported('setLocale'),
    failMutation: unsupported('failMutation'),
    errorLogCount: () => count('error'),
    dialogIds: unsupported('dialogIds'),
    pressDialogAction: unsupported('pressDialogAction'),
  };
}, ['identity', 'logger']);

describeLoaderConformance('SDK host', (): LoaderHarness => {
  const { log, count } = recorder();
  return {
    load: (definitions) => createPluginRegistry(definitions, { isBreakout: false, log }).map((p) => p.name),
    problemLogCount: () => count('warn', 'error'),
  };
});
