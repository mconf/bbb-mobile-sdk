import type { ComponentType } from 'react';
import type { MobilePluginHost } from './host.js';

/**
 * The parts of a plugin that the host mounts.
 *
 * @public
 */
export interface PluginParts {
  /**
   * A component with no UI. The host keeps it mounted while the plugin is active in
   * the meeting, across screen changes. It draws nothing on screen; it may render
   * providers.
   */
  Headless?: ComponentType;
}

/**
 * A plugin, as the app passes it to the host.
 *
 * @public
 */
export interface MobilePluginDefinition {
  /**
   * The plugin's name, as the meeting lists it. It is the plugin's only name: the host
   * passes it as {@link MobilePluginHost.pluginName}.
   */
  name: string;
  /**
   * The host API versions this plugin works with, as a semver range in npm's grammar:
   * caret (`^0.1.0`), tilde (`~0.1.2`), x-ranges (`0.1.x`), exact versions and `||`.
   *
   * The host compares the range with {@link MobilePluginHost.hostApiVersion} when it loads
   * the plugin. A plugin whose range does not match is skipped and logged. npm's
   * pre-release rule applies: a pre-release host version satisfies only a range that
   * names a pre-release of the same `major.minor.patch`.
   *
   * There is no compatibility promise before 1.0: any 0.x release may break plugins.
   */
  requiredHostApi: string;
  /**
   * Creates the plugin's parts. The host calls it once per meeting, when the SDK is
   * mounted, and never for a breakout room. Keep the plugin's state inside what this
   * function returns, not at module level; that state lasts one meeting.
   */
  create(host: MobilePluginHost): PluginParts;
}

/**
 * Declares a plugin. It checks the shape of the definition and returns it unchanged.
 *
 * @throws TypeError if `name` or `requiredHostApi` is not a non-empty string, or if
 * `create` is not a function.
 *
 * @public
 */
export function definePlugin(definition: MobilePluginDefinition): MobilePluginDefinition {
  const isName = (value: unknown): boolean => typeof value === 'string' && value.trim() !== '';

  if (!isName(definition.name)) {
    throw new TypeError('definePlugin: "name" must be a non-empty string');
  }
  if (!isName(definition.requiredHostApi)) {
    throw new TypeError('definePlugin: "requiredHostApi" must be a non-empty string');
  }
  if (typeof definition.create !== 'function') {
    throw new TypeError('definePlugin: "create" must be a function');
  }
  return definition;
}
