import type { HostLog } from './log';
import { errorInfo, type LoadedPlugin, type PluginRegistry } from './registry';

// The result of reading the meeting's plugin list: the query's data, or the error
// that ended it.
export type PluginListRead = { kind: 'data'; data: unknown } | { kind: 'error'; error: unknown };

interface ListRow {
  name: string;
  loadFailureReason: unknown;
  loadFailureSource: unknown;
}

const isObject = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null
);

// The rows of the `plugin` view, or null when the result holds no list. A row
// with no string name is skipped: it cannot match a plugin.
const listRows = (read: PluginListRead): ListRow[] | null => {
  if (read.kind !== 'data' || !isObject(read.data) || !Array.isArray(read.data.plugin)) return null;
  return read.data.plugin.filter(
    (row): row is ListRow => isObject(row) && typeof row.name === 'string',
  );
};

// The server passes a plugin's settings through as given, so nothing here
// assumes their shape.
const pluginSettings = (clientSettings: unknown, name: string): unknown => {
  if (!isObject(clientSettings) || !isObject(clientSettings.public)) return undefined;
  const { plugins } = clientSettings.public;
  if (!Array.isArray(plugins)) return undefined;
  const entry = plugins.find((p) => isObject(p) && p.name === name);
  return isObject(entry) ? entry.settings : undefined;
};

// Only the boolean true counts, so on a server that never set mobile.enabled,
// no plugin runs on phones.
const isMobileEnabled = (settings: unknown): boolean => (
  isObject(settings) && isObject(settings.mobile) && settings.mobile.enabled === true
);

// Which of the meeting's created plugins are active. As on web, the meeting's
// plugin list must name the plugin with an empty load failure reason. Its
// settings must also set mobile.enabled to true. A list that cannot be read
// leaves every plugin inactive.
export function selectActivePlugins(
  plugins: PluginRegistry,
  read: PluginListRead,
  clientSettings: unknown,
  log: HostLog,
): PluginRegistry {
  if (plugins.length === 0) return Object.freeze([]);

  const rows = listRows(read);
  const active: LoadedPlugin[] = [];

  if (rows === null) {
    log(
      'warn',
      {
        logCode: 'plugin_host_list_unavailable',
        extraInfo: read.kind === 'error' ? errorInfo(read.error) : { reason: 'no plugin list in the result' },
      },
      "Could not read the meeting's plugin list; no plugin runs in this meeting",
    );
  } else {
    plugins.forEach((plugin) => {
      const { name } = plugin;
      const own = rows.filter((row) => row.name === name);
      if (own.length === 0) {
        log(
          'warn',
          { logCode: 'plugin_host_not_listed', extraInfo: { pluginName: name } },
          `Plugin ${name}: the meeting's plugin list does not name it, or names it under another name because the server could not fetch or read its manifest; the plugin does not run`,
        );
        return;
      }
      if (!own.some((row) => row.loadFailureReason === '')) {
        const [failed] = own;
        log(
          'warn',
          {
            logCode: 'plugin_host_load_failed',
            extraInfo: {
              pluginName: name,
              failureReason: failed?.loadFailureReason,
              failureSource: failed?.loadFailureSource,
            },
          },
          `Plugin ${name}: the server failed to load it for this meeting; the plugin does not run`,
        );
        return;
      }
      if (!isMobileEnabled(pluginSettings(clientSettings, name))) {
        log(
          'info',
          { logCode: 'plugin_host_mobile_disabled', extraInfo: { pluginName: name } },
          `Plugin ${name}: its settings do not set mobile.enabled to true; the plugin does not run`,
        );
        return;
      }
      active.push(plugin);
    });
  }

  log(
    'info',
    {
      logCode: 'plugin_host_activation',
      extraInfo: { activePlugins: active.map((p) => p.name), total: plugins.length },
    },
    `${active.length} of ${plugins.length} plugins run in this meeting`,
  );
  return Object.freeze(active);
}
