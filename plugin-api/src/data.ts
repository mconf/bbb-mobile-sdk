/**
 * Result of a data hook: a loading flag, then data or an error.
 *
 * @public
 */
export interface GraphqlResult<T> {
  /** True until the first data or error arrives. */
  loading: boolean;
  /** The data, once it arrived. */
  data?: T;
  /** Why the data could not be read, if it could not. */
  error?: unknown;
}

/**
 * Sends a mutation. The promise resolves when the mutation was sent and never rejects:
 * the host logs a failure instead of throwing it. A resolved promise does not mean the
 * server applied the change; only data the plugin watches confirms it.
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
  /** True while the last call is being sent. */
  loading: boolean;
  /** Why the last call failed, if it failed. */
  error?: unknown;
}

/**
 * Which entries of a data channel a plugin reads: every entry, only the latest one, or
 * only the entries created after the plugin subscribed.
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
  /** The roles that receive the entry; empty when it was sent to every user. */
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
  /** The entries, newest first. Entries created at the same time are ordered by entry id. */
  data: GraphqlResult<DataChannelEntry<T>[]>;
  /** Adds an entry. Without `receivers`, every user in the meeting receives it. */
  pushEntry(payload: T, options?: { receivers?: DataChannelReceiver[] }): void;
  /** Replaces the payload of an existing entry. */
  replaceEntry(entryId: string, payload: T): void;
  /** Deletes entries by id. The single id `'RESET_DATA_CHANNEL'` deletes every entry. */
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
  /** The user's id in the system that created the meeting. */
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
  /** The user's id in the system that created the meeting. */
  extId: string;
  /** The name shown to other users. */
  name: string;
  /** Whether the user is a moderator. */
  isModerator: boolean;
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
  /** The app is inside a breakout room. */
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
