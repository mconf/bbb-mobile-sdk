import {
  useCallback, useEffect, useMemo, useState, useSyncExternalStore,
} from 'react';
import { HOST_API_VERSION } from '../version.js';
import type {
  ActionsSheetItem,
  Capabilities,
  ConfirmDialog,
  DataChannel,
  DataChannelEntry,
  DataChannelMode,
  DataChannelReceiver,
  GraphqlResult,
  HostCurrentUser,
  HostUserBasicInfo,
  InfoDialog,
  MobilePluginHost,
  MutationState,
  MutationTrigger,
  Notice,
  PluginLogRecord,
  PluginLogger,
} from '../index.js';

/**
 * Options of {@link createMockHost}.
 *
 * @public
 */
export interface MockHostOptions {
  /** Defaults to `'mock-plugin'`. */
  pluginName?: string;
  /** Defaults to `HOST_API_VERSION`. */
  hostApiVersion?: string;
}

/**
 * A mutation a plugin sent through the mock host.
 *
 * @public
 */
export interface MockMutationCall {
  /** The mutation document, as the plugin passed it. */
  mutation: string;
  /**
   * A JSON copy of the call's variables, taken when the call was made: a host sends
   * JSON. Variables that JSON cannot hold, such as a cycle, are kept as passed.
   */
  variables: unknown;
}

/**
 * A subscription a plugin's `useCustomSubscription` started on the mock host.
 *
 * @public
 */
export interface MockSubscription {
  /** The subscription document, as the plugin passed it. */
  query: string;
  /** A JSON copy of the variables, taken when the subscription started. */
  variables: unknown;
}

/**
 * A write a plugin made to a data channel of the mock host.
 *
 * @public
 */
export type MockDataChannelWrite = { channelName: string; subChannelName: string } & (
  | { type: 'push'; payload: unknown; receivers?: DataChannelReceiver[] }
  | { type: 'replace'; entryId: string; payload: unknown }
  | { type: 'delete'; entryIds: string[] }
);

/**
 * A dialog a plugin asked the mock host to show.
 *
 * @public
 */
export type MockDialog =
  | { kind: 'confirm'; dialog: ConfirmDialog }
  | { kind: 'info'; dialog: InfoDialog };

/**
 * A log record a plugin wrote to the mock host.
 *
 * @public
 */
export interface MockLogEntry {
  /** The level the record was written at. */
  level: keyof PluginLogger;
  /** The record. */
  record: PluginLogRecord;
  /** The message. */
  message: string;
}

/**
 * Drives a mock host from a test: sets what the data hooks return and reads what the
 * plugin asked the host to do.
 *
 * Mounted hooks re-render after a `set…` call. Wrap those calls in React's `act`.
 * The lists are copies taken when they are read: read them again after the plugin acts.
 *
 * @public
 */
export interface MockHostController {
  /** Sets what `useCurrentUser` returns. */
  setCurrentUser(result: GraphqlResult<HostCurrentUser>): void;
  /** Sets what `useUsersBasicInfo` returns. */
  setUsersBasicInfo(result: GraphqlResult<{ user: HostUserBasicInfo[] }>): void;
  /** Sets what `usePluginSettings` returns. */
  setPluginSettings(result: GraphqlResult<unknown>): void;
  /** Sets what `useLocale` returns, as the app's language change would. */
  setLocale(locale: string): void;
  /** Sets what `useCapabilities` returns. */
  setCapabilities(capabilities: Capabilities): void;
  /**
   * Sets the result of `useCustomSubscription` for this exact query text, for any variables.
   * A hook whose arguments change returns this result at once, with no loading step.
   */
  setSubscriptionResult(query: string, result: GraphqlResult<unknown>): void;
  /**
   * Sets what `useDataChannel` returns for a channel. Without `subChannelName`, it sets the
   * `'default'` sub-channel, which `useDataChannel` reads when the plugin names none. The
   * mock returns the entries as given: it does not sort them, filter them by mode or apply
   * the plugin's writes. To test a mode, set what that mode would deliver.
   */
  setDataChannelEntries(
    channelName: string,
    result: GraphqlResult<DataChannelEntry<unknown>[]>,
    subChannelName?: string,
  ): void;
  /**
   * Makes later calls of this mutation fail: the trigger still resolves, the failure is
   * logged and shows in the state of the hook that sent it. Pass `undefined` to make it
   * succeed again.
   */
  setMutationError(mutation: string, error: unknown): void;
  /**
   * Presses a button of the shown dialog, the first in `dialogs`, as the user would: the
   * dialog closes, then the button's `onPress` runs. A queued dialog cannot be pressed.
   *
   * @throws Error if the shown dialog is not a confirm dialog with this id, or it has no
   * button at `actionIndex`.
   */
  pressDialogAction(id: string, actionIndex: number): void;

  /**
   * Every subscription started, oldest first: one when a hook mounts, and one each time its
   * query or variables change, compared as a host compares them.
   */
  readonly subscriptions: readonly MockSubscription[];
  /** Every mutation sent, oldest first. */
  readonly mutations: readonly MockMutationCall[];
  /** Every data-channel write, oldest first. */
  readonly dataChannelWrites: readonly MockDataChannelWrite[];
  /** The items of the last `setActionsSheetItems` call, without the items it dropped. */
  readonly actionsSheetItems: readonly ActionsSheetItem[];
  /** The id of every `openSelector` call that opened a selector, oldest first. */
  readonly openedSelectors: readonly string[];
  /** The dialogs asked for and not closed, oldest first. */
  readonly dialogs: readonly MockDialog[];
  /** Every notice, oldest first. */
  readonly notices: readonly Notice[];
  /** Every log record, oldest first. */
  readonly logs: readonly MockLogEntry[];
}

/**
 * A mock host and the controller that drives it.
 *
 * @public
 */
export interface MockHost {
  /** The host to give to the plugin's `create`. */
  host: MobilePluginHost;
  /** Drives the host from the test. */
  controller: MockHostController;
}

const LOADING: GraphqlResult<never> = { loading: true };
const IDLE: MutationState = { loading: false };
const SENDING: MutationState = { loading: true };

const jsonCopy = (value: unknown): unknown => {
  if (value === undefined) return undefined;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
};

// How a host compares subscription variables: JSON with the top-level keys sorted.
const variablesKey = (variables?: Record<string, unknown>): string => (
  variables === undefined
    ? 'undefined'
    : JSON.stringify(Object.fromEntries(
      Object.entries(variables).sort(([a], [b]) => (a < b ? -1 : Number(a > b))),
    ))
);

const DEFAULT_SUB_CHANNEL = 'default';

const channelKey = (channelName: string, subChannelName: string): string => (
  JSON.stringify([channelName, subChannelName])
);

/**
 * Creates an in-memory host for plugin unit tests. It keeps what the test sets and
 * records what the plugin asks for; it draws nothing and talks to no server.
 *
 * Defaults: a loaded viewer as the current user, a user list that holds only that user,
 * empty settings, locale `en`, every capability off. Custom subscriptions and data
 * channels are loading until the test sets them. `setCurrentUser` does not change the
 * user list: a test that needs the new current user in the list sets the list too.
 *
 * Some rules of the contract are host code that the mock does not have. The mock:
 *
 * - returns data-channel entries as the test set them: it does not sort them, apply the
 *   read mode or apply the plugin's writes;
 * - never calls a confirm dialog's `isStillRelevant`;
 * - returns the locale as set: it does not turn `pt_BR` into `pt-BR`;
 * - has no app notices, so it never makes a plugin notice wait for one;
 * - is ready from the first render: `pushEntry` and mutation triggers are set at once, so
 *   it never drops a write made too early;
 * - returns a custom subscription's result by query text alone, and with no loading step
 *   after its arguments change.
 *
 * @public
 */
export function createMockHost(options: MockHostOptions = {}): MockHost {
  const listeners = new Set<() => void>();
  const subscribe = (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  };
  const emit = (): void => { listeners.forEach((listener) => listener()); };

  let currentUser: GraphqlResult<HostCurrentUser> = {
    loading: false,
    data: {
      userId: 'mock-user-id',
      extId: 'mock-ext-id',
      name: 'Mock User',
      role: 'VIEWER',
      presenter: false,
    },
  };
  let usersBasicInfo: GraphqlResult<{ user: HostUserBasicInfo[] }> = {
    loading: false,
    data: {
      user: [{
        userId: 'mock-user-id',
        extId: 'mock-ext-id',
        name: 'Mock User',
        isModerator: false,
        bot: false,
      }],
    },
  };
  let pluginSettings: GraphqlResult<unknown> = { loading: false, data: {} };
  let locale = 'en';
  let capabilities: Capabilities = {
    mediaGroupAudioRouting: false,
    mediaGroupCameraRouting: false,
    inBreakout: false,
    placements: {},
  };
  const subscriptionResults = new Map<string, GraphqlResult<unknown>>();
  const dataChannelResults = new Map<string, GraphqlResult<DataChannelEntry<unknown>[]>>();
  const mutationErrors = new Map<string, unknown>();

  const subscriptions: MockSubscription[] = [];
  const mutations: MockMutationCall[] = [];
  const dataChannelWrites: MockDataChannelWrite[] = [];
  let actionsSheetItems: readonly ActionsSheetItem[] = [];
  const openedSelectors: string[] = [];
  let dialogs: MockDialog[] = [];
  const notices: Notice[] = [];
  const logs: MockLogEntry[] = [];

  const showDialog = (entry: MockDialog): void => {
    const index = dialogs.findIndex((shown) => shown.dialog.id === entry.dialog.id);
    dialogs = index === -1
      ? [...dialogs, entry]
      : dialogs.map((shown, at) => (at === index ? entry : shown));
  };
  const closeDialog = (id: string): void => {
    dialogs = dialogs.filter((entry) => entry.dialog.id !== id);
  };

  const log = (level: keyof PluginLogger) => (record: PluginLogRecord, message: string): void => {
    logs.push({ level, record, message });
  };
  const logger: PluginLogger = {
    debug: log('debug'),
    info: log('info'),
    warn: log('warn'),
    error: log('error'),
  };

  const host: MobilePluginHost = {
    hostApiVersion: options.hostApiVersion ?? HOST_API_VERSION,
    pluginName: options.pluginName ?? 'mock-plugin',

    useCurrentUser: () => useSyncExternalStore(subscribe, () => currentUser),
    useUsersBasicInfo: () => useSyncExternalStore(subscribe, () => usersBasicInfo),
    useCustomSubscription: <T>(
      query: string,
      subscriptionOptions?: { variables?: Record<string, unknown> },
    ) => {
      const variables = subscriptionOptions?.variables;
      const key = variablesKey(variables);
      // `key` stands for `variables`, so a new object with equal JSON is not recorded as a
      // new subscription.
      useEffect(() => {
        subscriptions.push({ query, variables: jsonCopy(variables) });
      }, [query, key]);
      return useSyncExternalStore(
        subscribe,
        () => (subscriptionResults.get(query) ?? LOADING) as GraphqlResult<T>,
      );
    },
    useCustomMutation: <V>(mutation: string) => {
      // Each hook keeps the state of its own last call, as a host's mutation hook does.
      const [state, setState] = useState<MutationState>(IDLE);
      const trigger = useCallback<MutationTrigger<V>>(async ({ variables }) => {
        // Read before the await, so a setMutationError made while this call is in flight
        // affects only later calls.
        const error = mutationErrors.get(mutation);
        setState(SENDING);
        mutations.push({ mutation, variables: jsonCopy(variables) });
        await Promise.resolve();
        if (error === undefined) {
          setState(IDLE);
        } else {
          setState({ loading: false, error });
          logger.error({ logCode: 'mock_host_mutation_failed' }, 'Mutation failed');
        }
      }, [mutation]);
      return [trigger, state];
    },
    useDataChannel: <T>(
      channelName: string,
      _mode?: DataChannelMode,
      subChannelName: string = DEFAULT_SUB_CHANNEL,
    ): DataChannel<T> => {
      const key = channelKey(channelName, subChannelName);
      const data = useSyncExternalStore(
        subscribe,
        () => (dataChannelResults.get(key) ?? LOADING) as GraphqlResult<DataChannelEntry<T>[]>,
      );
      return useMemo(() => {
        const channel = { channelName, subChannelName };
        return {
          data,
          pushEntry: (payload, pushOptions) => {
            dataChannelWrites.push(pushOptions?.receivers === undefined
              ? { ...channel, type: 'push', payload }
              : { ...channel, type: 'push', payload, receivers: pushOptions.receivers });
          },
          replaceEntry: (entryId, payload) => {
            dataChannelWrites.push({ ...channel, type: 'replace', entryId, payload });
          },
          deleteEntry: (entryIds) => {
            dataChannelWrites.push({ ...channel, type: 'delete', entryIds });
          },
        };
      }, [data, channelName, subChannelName]);
    },
    usePluginSettings: <S>() => useSyncExternalStore(
      subscribe,
      () => pluginSettings as GraphqlResult<S>,
    ),
    useLocale: () => useSyncExternalStore(subscribe, () => locale),
    useCapabilities: () => useSyncExternalStore(subscribe, () => capabilities),

    setActionsSheetItems: (items) => {
      const ids = new Set<string>();
      actionsSheetItems = items.filter((item) => {
        if (!ids.has(item.id)) {
          ids.add(item.id);
          return true;
        }
        logger.warn(
          { logCode: 'mock_host_repeated_item_id', extraInfo: { id: item.id } },
          'Actions sheet item dropped: its id is already used',
        );
        return false;
      });
    },
    openSelector: (id) => {
      const item = actionsSheetItems.find((candidate) => candidate.id === id);
      if (item?.type !== 'selector' || item.pending === true) {
        logger.warn(
          { logCode: 'mock_host_selector_not_opened', extraInfo: { id } },
          item?.type === 'selector' ? 'The selector item is pending' : 'No selector item has this id',
        );
        return;
      }
      openedSelectors.push(id);
    },
    dialogs: {
      confirm: (dialog) => {
        if (!Array.isArray(dialog.actions) || dialog.actions.length === 0) {
          logger.error({ logCode: 'mock_host_dialog_without_actions' }, 'Dialog has no buttons');
          return;
        }
        showDialog({ kind: 'confirm', dialog });
      },
      info: (dialog) => { showDialog({ kind: 'info', dialog }); },
      close: closeDialog,
    },
    notify: (notice) => { notices.push(notice); },

    logger,
  };

  const controller: MockHostController = {
    setCurrentUser: (result) => { currentUser = result; emit(); },
    setUsersBasicInfo: (result) => { usersBasicInfo = result; emit(); },
    setPluginSettings: (result) => { pluginSettings = result; emit(); },
    setLocale: (value) => { locale = value; emit(); },
    setCapabilities: (value) => { capabilities = value; emit(); },
    setSubscriptionResult: (query, result) => { subscriptionResults.set(query, result); emit(); },
    setDataChannelEntries: (channelName, result, subChannelName = DEFAULT_SUB_CHANNEL) => {
      dataChannelResults.set(channelKey(channelName, subChannelName), result);
      emit();
    },
    setMutationError: (mutation, error) => {
      if (error === undefined) {
        mutationErrors.delete(mutation);
      } else {
        mutationErrors.set(mutation, error);
      }
    },
    pressDialogAction: (id, actionIndex) => {
      const [entry] = dialogs;
      if (entry?.kind !== 'confirm' || entry.dialog.id !== id) {
        throw new Error(`mock host: the shown dialog is not a confirm dialog with id "${id}"`);
      }
      const action = entry.dialog.actions[actionIndex];
      if (action === undefined) {
        throw new Error(`mock host: dialog "${id}" has no button at index ${actionIndex}`);
      }
      closeDialog(id);
      action.onPress();
    },

    get subscriptions() { return [...subscriptions]; },
    get mutations() { return [...mutations]; },
    get dataChannelWrites() { return [...dataChannelWrites]; },
    get actionsSheetItems() { return [...actionsSheetItems]; },
    get openedSelectors() { return [...openedSelectors]; },
    get dialogs() { return [...dialogs]; },
    get notices() { return [...notices]; },
    get logs() { return [...logs]; },
  };

  return { host, controller };
}
