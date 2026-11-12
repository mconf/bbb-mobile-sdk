import type {
  Capabilities,
  DataChannel,
  DataChannelMode,
  GraphqlResult,
  HostCurrentUser,
  HostUserBasicInfo,
  MutationState,
  MutationTrigger,
  PluginLogger,
} from './data.js';
import type {
  ActionsSheetItem,
  ConfirmDialog,
  InfoDialog,
  Notice,
} from './items.js';

/**
 * What the host gives to one plugin. The plugin receives it in
 * {@link MobilePluginDefinition.create}.
 *
 * Members named `use…` are React hooks: call them only from the plugin's
 * {@link PluginParts.Headless} component or from hooks it calls.
 *
 * @public
 */
export interface MobilePluginHost {
  /** The version of the host API that the running host implements. */
  readonly hostApiVersion: string;
  /**
   * The plugin's {@link MobilePluginDefinition.name}. The host reads the plugin's settings
   * and data channels under this name.
   */
  readonly pluginName: string;

  /** The user running the app. */
  useCurrentUser(): GraphqlResult<HostCurrentUser>;
  /** Every user in the meeting, bots included. */
  useUsersBasicInfo(): GraphqlResult<{ user: HostUserBasicInfo[] }>;
  /** Subscribes to a GraphQL subscription document written by the plugin. */
  useCustomSubscription<T>(
    query: string,
    options?: { variables?: Record<string, unknown> },
  ): GraphqlResult<T>;
  /**
   * Prepares a GraphQL mutation document written by the plugin. The trigger is null until
   * the host can send the mutation, so a plugin checks it before a call. The host does not
   * queue calls for later.
   */
  useCustomMutation<V>(mutation: string): [MutationTrigger<V> | null, MutationState];
  /**
   * Reads and writes one of the plugin's data channels. `mode` defaults to
   * `'Hooks::DataChannel::AllItems'`. `subChannelName` defaults to `'default'`, the
   * sub-channel the BBB web client uses when a plugin names none.
   */
  useDataChannel<T>(
    channelName: string,
    mode?: DataChannelMode,
    subChannelName?: string,
  ): DataChannel<T>;
  /** The plugin's settings, from the client settings the app loaded when it joined. */
  usePluginSettings<S = Record<string, unknown>>(): GraphqlResult<S>;
  /** The app language as a BCP 47 tag, such as `pt-BR`. It updates when the language changes. */
  useLocale(): string;
  /** What the current meeting and host can do. */
  useCapabilities(): Capabilities;

  /**
   * Replaces the items this plugin shows in the actions sheet. An empty list removes them.
   * Item ids must be unique: the host keeps the first item with an id, and logs and drops
   * each later item with the same id.
   */
  setActionsSheetItems(items: readonly ActionsSheetItem[]): void;
  /**
   * Opens the option list of one of this plugin's selector items, even when the actions
   * sheet is closed. The host logs and ignores an id that names no selector item, and the
   * id of a pending item.
   */
  openSelector(id: string): void;
  /**
   * Dialogs the host draws. They are queued, and never replace a dialog with another id.
   * A dialog with the id of one that is shown or queued replaces it in place and keeps
   * its turn.
   */
  readonly dialogs: {
    /** Shows a dialog that asks the user to choose an action. */
    confirm(dialog: ConfirmDialog): void;
    /** Shows a dialog that only informs the user. */
    info(dialog: InfoDialog): void;
    /** Closes the dialog with this id, shown or queued. Other dialogs are not affected. */
    close(id: string): void;
  };
  /** Shows a notice. It never replaces a notice of the app itself. */
  notify(notice: Notice): void;

  /** Logger for the plugin. */
  readonly logger: PluginLogger;
}
