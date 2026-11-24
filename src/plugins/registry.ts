import type { MobilePluginHost, PluginParts } from '@mconf/bbb-mobile-plugin-api';
import { selectPlugins } from './definitions';
import { createPluginHost } from './host';
import type { HostLog } from './log';

export interface LoadedPlugin {
  readonly name: string;
  readonly host: MobilePluginHost;
  readonly parts: PluginParts;
}

export type PluginRegistry = readonly LoadedPlugin[];

export const EMPTY_REGISTRY: PluginRegistry = Object.freeze([]);

const errorInfo = (error: unknown): Record<string, unknown> => ({
  errorName: error instanceof Error ? error.name : typeof error,
  errorMessage: error instanceof Error ? error.message : String(error),
});

// Creates the meeting's plugins: create() runs once for each plugin the host
// loads, and what it returns is the plugin's state for this meeting. A create()
// that throws, or that returns a promise or no object, drops only that plugin.
export function createPluginRegistry(
  list: unknown,
  { isBreakout, log }: { isBreakout: boolean; log: HostLog },
): PluginRegistry {
  if (isBreakout) return EMPTY_REGISTRY;

  const loaded: LoadedPlugin[] = [];
  selectPlugins(list, log).forEach((definition) => {
    const { name } = definition;
    const host = createPluginHost(definition, log);
    let parts: unknown;
    try {
      parts = definition.create(host);
    } catch (error) {
      log(
        'error',
        { logCode: 'plugin_host_create_failed', extraInfo: { pluginName: name, ...errorInfo(error) } },
        `Plugin ${name}: create() threw; the plugin is not loaded`
      );
      return;
    }
    if (!parts || typeof parts !== 'object') {
      log(
        'error',
        { logCode: 'plugin_host_create_failed', extraInfo: { pluginName: name, returned: typeof parts } },
        `Plugin ${name}: create() returned no parts object; the plugin is not loaded`
      );
      return;
    }
    // create() is synchronous. An async one returns a promise, which is not parts;
    // its rejection is caught so that it does not surface as an unhandled one. The
    // check runs in a try: a hostile `then` must not break the App mount.
    let isPromise: boolean;
    try {
      isPromise = typeof (parts as { then?: unknown }).then === 'function';
      if (isPromise) (parts as Promise<unknown>).then(undefined, () => {});
    } catch (error) {
      log(
        'error',
        { logCode: 'plugin_host_create_failed', extraInfo: { pluginName: name, ...errorInfo(error) } },
        `Plugin ${name}: create() returned parts that cannot be read; the plugin is not loaded`
      );
      return;
    }
    if (isPromise) {
      log(
        'error',
        { logCode: 'plugin_host_create_failed', extraInfo: { pluginName: name, returned: 'promise' } },
        `Plugin ${name}: create() returned a promise; the plugin is not loaded`
      );
      return;
    }
    loaded.push({ name, host, parts: parts as PluginParts });
  });
  return Object.freeze(loaded);
}
