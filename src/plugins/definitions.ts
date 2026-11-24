import { satisfies, validRange } from 'semver';
import type { MobilePluginDefinition } from '@mconf/bbb-mobile-plugin-api';
import type { HostLog } from './log';
import { HOST_API_VERSION } from './version';

const isName = (value: unknown): value is string => (
  typeof value === 'string' && value.trim() !== ''
);

// The app may pass objects that definePlugin never checked, so the host applies
// the same rules to each entry.
const isDefinition = (value: unknown): value is MobilePluginDefinition => {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Partial<MobilePluginDefinition>;
  return isName(entry.name) && isName(entry.requiredHostApi) && typeof entry.create === 'function';
};

// The plugins the host loads from the app's list, in list order. An entry that is
// not a definition is dropped. Of two entries with one name, the first is kept: the
// meeting knows a plugin only by its name. A plugin whose host API range does not
// include `hostVersion` is skipped; each drop is logged.
export function selectPlugins(
  list: unknown,
  log: HostLog,
  hostVersion: string = HOST_API_VERSION,
): MobilePluginDefinition[] {
  if (list == null) return [];
  if (!Array.isArray(list)) {
    log('error', { logCode: 'plugin_host_invalid_list' }, 'The plugins list is not an array');
    return [];
  }

  const byName = new Map<string, MobilePluginDefinition>();
  list.forEach((entry, index) => {
    if (!isDefinition(entry)) {
      log(
        'error',
        { logCode: 'plugin_host_invalid_definition', extraInfo: { index } },
        `Plugins list entry ${index} is not a plugin definition`
      );
    } else if (byName.has(entry.name)) {
      log(
        'warn',
        { logCode: 'plugin_host_duplicate_name', extraInfo: { pluginName: entry.name, index } },
        `Two plugins are named ${entry.name}; the first one is loaded`
      );
    } else {
      byName.set(entry.name, entry);
    }
  });

  return [...byName.values()].filter((definition) => {
    const { name: pluginName, requiredHostApi } = definition;
    if (validRange(requiredHostApi) === null) {
      log(
        'error',
        { logCode: 'plugin_host_invalid_range', extraInfo: { pluginName, requiredHostApi } },
        `Plugin ${pluginName} has a host API range that is not a semver range; it is skipped`
      );
      return false;
    }
    if (!satisfies(hostVersion, requiredHostApi)) {
      log('warn', {
        logCode: 'plugin_host_incompatible',
        extraInfo: { pluginName, requiredHostApi, hostApiVersion: hostVersion },
      }, `Plugin ${pluginName} needs host API ${requiredHostApi}, not ${hostVersion}; it is skipped`);
      return false;
    }
    return true;
  });
}
