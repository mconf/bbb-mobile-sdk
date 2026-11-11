/**
 * Contract between the BigBlueButton mobile SDK plugin host and its plugins.
 *
 * @packageDocumentation
 */

export { HOST_API_VERSION } from './version.js';
export { definePlugin } from './plugin.js';
export type { MobilePluginDefinition, PluginParts } from './plugin.js';
export type { MobilePluginHost } from './host.js';
export type {
  Capabilities,
  DataChannel,
  DataChannelEntry,
  DataChannelMode,
  DataChannelReceiver,
  GraphqlResult,
  HostCurrentUser,
  HostUserBasicInfo,
  MutationState,
  MutationTrigger,
  PluginLogMethod,
  PluginLogRecord,
  PluginLogger,
} from './data.js';
export type {
  ActionsSheetItem,
  ConfirmDialog,
  DialogAction,
  InfoDialog,
  Notice,
  SelectorItem,
  SelectorOption,
} from './items.js';
