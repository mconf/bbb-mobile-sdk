import type {
  Capabilities,
  MobilePluginDefinition,
  MobilePluginHost,
  PluginLogger,
} from '@mconf/bbb-mobile-plugin-api';
import type { CustomSubscriptions } from './custom-subscriptions';
import type { PluginGraphqlState } from './graphql-state';
import type { HostLog, HostLogLevel } from './log';
import { HOST_API_VERSION } from './version';

const LEVELS: readonly HostLogLevel[] = ['debug', 'info', 'warn', 'error'];

const createPluginLogger = (pluginName: string, log: HostLog): PluginLogger => {
  const entries = LEVELS.map((level) => [
    level,
    (record: Parameters<HostLog>[1], message: string) => log(level, {
      logCode: record.logCode,
      extraInfo: { ...record.extraInfo, pluginName },
    }, message),
  ]);
  return Object.fromEntries(entries) as PluginLogger;
};

// Members this host version does not provide yet. Calling one throws, so a plugin
// that needs it fails at once instead of reading empty data.
const notAvailable = (member: string) => (): never => {
  throw new Error(`${member} is not available in this host version`);
};

// The App's pieces a plugin host reads; the app creates them with the instance.
export interface PluginHostServices {
  useCapabilities?: () => Capabilities;
  graphql?: { state: PluginGraphqlState; subscriptions: CustomSubscriptions };
}

// The host object one plugin gets in create(). Members past its identity, its
// logger and the services the app passed in throw.
export function createPluginHost(
  definition: MobilePluginDefinition,
  log: HostLog,
  { useCapabilities, graphql }: PluginHostServices = {},
): MobilePluginHost {
  return {
    hostApiVersion: HOST_API_VERSION,
    pluginName: definition.name,
    useCurrentUser: notAvailable('useCurrentUser'),
    useUsersBasicInfo: notAvailable('useUsersBasicInfo'),
    useCustomSubscription: graphql
      ? graphql.subscriptions.hookFor(definition.name)
      : notAvailable('useCustomSubscription'),
    useCustomMutation: notAvailable('useCustomMutation'),
    useDataChannel: notAvailable('useDataChannel'),
    usePluginSettings: notAvailable('usePluginSettings'),
    useLocale: notAvailable('useLocale'),
    useCapabilities: useCapabilities ?? notAvailable('useCapabilities'),
    setActionsSheetItems: notAvailable('setActionsSheetItems'),
    openSelector: notAvailable('openSelector'),
    dialogs: {
      confirm: notAvailable('dialogs.confirm'),
      info: notAvailable('dialogs.info'),
      close: notAvailable('dialogs.close'),
    },
    notify: notAvailable('notify'),
    logger: createPluginLogger(definition.name, log),
  };
}
