/**
 * Result of a data hook: a loading flag, then data or an error.
 *
 * @public
 */
export interface GraphqlResult<T> {
  /**
   * True until the first data or error arrives. `useCustomSubscription` sets it again
   * after its arguments change.
   */
  loading: boolean;
  /** The data, once it arrived. */
  data?: T;
  /** Why the data could not be read, if it could not. */
  error?: unknown;
}

/**
 * Sends a mutation. The promise resolves when the mutation was sent and never rejects.
 * A failure may be known only after that: the host logs it and shows it in
 * {@link MutationState}. A resolved promise does not mean the server applied the change;
 * only data the plugin watches confirms it.
 *
 * @public
 */
export type MutationTrigger<V> = (args: { variables: V }) => Promise<void>;

/**
 * State of the last call of a {@link MutationTrigger}.
 *
 * @public
 */
export interface MutationState {
  /**
   * True from the call until the host knows whether it failed, which may be after the
   * trigger's promise resolved. `error` is set at that point if the call failed.
   */
  loading: boolean;
  /** Why the last call failed, if it failed. */
  error?: unknown;
}

/**
 * Which entries of a data channel {@link MobilePluginHost.useDataChannel} delivers. Each
 * delivery is a list in the order of {@link DataChannel.data}.
 *
 * - `'Hooks::DataChannel::AllItems'`: each update delivers every entry of the channel.
 * - `'Hooks::DataChannel::LatestItem'`: the first delivery holds every entry. After that,
 *   each update delivers only the entries it added or replaced, so after a replace of an
 *   older entry, `data[0]` is that entry and not the newest one. After any delete, the
 *   update delivers the channel's newest entry, so `data` never holds a deleted entry.
 * - `'Hooks::DataChannel::NewItems'`: each update delivers the entries it added or
 *   replaced that were created at or after the moment the hook subscribed. The host reads
 *   that moment from the device clock and compares it with the server's `createdAt`, so a
 *   device clock that is off can let in or leave out entries created near that moment.
 *   The first delivery holds the entries created at or after that moment, usually none. A
 *   delete delivers nothing, unless it leaves the channel empty.
 *
 * In the `LatestItem` and `NewItems` modes a delivery is not the whole channel: a plugin
 * that needs earlier entries keeps them itself. A reset, or deletes that leave the
 * channel empty, deliver an empty list. An update with nothing to deliver leaves `data`
 * as it was.
 *
 * The hooks of a plugin that read one channel, sub-channel and mode share one reader, as
 * in the BBB web client. The first of them sets the subscribe time. A hook that mounts
 * while another one reads first gets the reader's last delivery, not every entry, and the
 * hooks already mounted get nothing new. The reader ends when the last hook reading it
 * unmounts; a hook mounted after that starts a new one.
 *
 * The BBB web client delivers the same, except for these bugs:
 *
 * - after a delete, its `LatestItem` delivers nothing and keeps the deleted entry;
 * - it delivers an empty list, with `loading` false, before the first data;
 * - a `NewItems` reader that has delivered nothing yet delivers nothing on a reset;
 * - when a hook mounts, every hook of that reader gets the last delivery again;
 * - when one hook unmounts, the reader of a mode other than the first one read on that
 *   channel can end while other hooks still read it.
 *
 * @public
 */
export type DataChannelMode =
  | 'Hooks::DataChannel::AllItems'
  | 'Hooks::DataChannel::LatestItem'
  | 'Hooks::DataChannel::NewItems';

/**
 * One entry of a data channel.
 *
 * @public
 */
export interface DataChannelEntry<T> {
  /** Identifies the entry in its channel. */
  entryId: string;
  /** When the entry was created, as an ISO 8601 date and time. */
  createdAt: string;
  /** When the entry was last replaced, as an ISO 8601 date and time. */
  updatedAt: string;
  /** The id of the user who created the entry. */
  createdBy: string;
  /** The channel the entry belongs to. */
  channelName: string;
  /** The sub-channel the entry belongs to. */
  subChannelName: string;
  /** The plugin that owns the channel. */
  pluginName: string;
  /**
   * The roles the entry was sent to. Empty when it named no role: it went to every user,
   * or only to users named by id.
   */
  toRoles: string[];
  /** What the plugin wrote. */
  payloadJson: T;
}

/**
 * Who receives a data-channel entry: one user, or every user with a role.
 *
 * @public
 */
export type DataChannelReceiver = { userId: string } | { role: string };

/**
 * A data channel of the plugin: its entries and the calls that write to it.
 *
 * @public
 */
export interface DataChannel<T> {
  /**
   * The entries the mode delivers, newest first by `createdAt`. The order of entries with
   * the same `createdAt` is not defined, as in the BBB web client.
   *
   * `loading` stays true until the channel's first data or an error arrives. An empty list
   * means there is nothing to deliver, never that the data has not arrived yet.
   */
  data: GraphqlResult<DataChannelEntry<T>[]>;
  /**
   * Adds an entry. Without `receivers`, every user in the meeting receives it.
   *
   * It is undefined until the host can write to the channel, so a plugin checks it before
   * a call. The host does not queue writes for later.
   */
  pushEntry: ((payload: T, options?: { receivers?: DataChannelReceiver[] }) => void) | undefined;
  /**
   * Replaces the payload of an existing entry. A call made while `pushEntry` is undefined
   * is dropped, and the host logs the drop at debug level.
   */
  replaceEntry(entryId: string, payload: T): void;
  /**
   * Deletes entries by id. The single id `'RESET_DATA_CHANNEL'` deletes every entry. A call
   * made while `pushEntry` is undefined is dropped, and the host logs the drop at debug
   * level.
   */
  deleteEntry(entryIds: string[]): void;
}

/**
 * The user running the app.
 *
 * @public
 */
export interface HostCurrentUser {
  /** The user's id in the meeting. */
  userId: string;
  /**
   * The `userID` given in the join call. Without one, the server uses the user's id in
   * the meeting, which changes when the user joins again.
   */
  extId: string;
  /** The name shown to other users. */
  name: string;
  /** The user's role in the meeting, such as `'MODERATOR'` or `'VIEWER'`. */
  role: string;
  /** Whether the user is the presenter. */
  presenter: boolean;
}

/**
 * Basic information about one user in the meeting.
 *
 * @public
 */
export interface HostUserBasicInfo {
  /** The user's id in the meeting. */
  userId: string;
  /** The same id as {@link HostCurrentUser.extId}. */
  extId: string;
  /** The name shown to other users. */
  name: string;
  /** Whether the user is a moderator. */
  isModerator: boolean;
  /** Whether the user is a bot. */
  bot: boolean;
}

/**
 * What the current meeting and host can do. A plugin reads it to decide whether to
 * show anything.
 *
 * @public
 */
export interface Capabilities {
  /** The meeting routes audio per listener, by media group. */
  mediaGroupAudioRouting: boolean;
  /** The meeting routes cameras per viewer, by media group. */
  mediaGroupCameraRouting: boolean;
  /** The user is in a breakout room, so the main room's audio is off. */
  inBreakout: boolean;
  /** Version of each placement the host draws, by placement name. */
  placements: Readonly<Record<string, number>>;
}

/**
 * One log record. Do not put personal data in it.
 *
 * @public
 */
export interface PluginLogRecord {
  /** A fixed code that names the event, in snake case. */
  logCode: string;
  /** Data about the event. */
  extraInfo?: Record<string, unknown>;
}

/**
 * Writes one log record at a level.
 *
 * @public
 */
export type PluginLogMethod = (record: PluginLogRecord, message: string) => void;

/**
 * Logger that writes into the host's log stream, tagged with the plugin name.
 *
 * @public
 */
export interface PluginLogger {
  /** Writes a record at the debug level. */
  debug: PluginLogMethod;
  /** Writes a record at the info level. */
  info: PluginLogMethod;
  /** Writes a record at the warn level. */
  warn: PluginLogMethod;
  /** Writes a record at the error level. */
  error: PluginLogMethod;
}
