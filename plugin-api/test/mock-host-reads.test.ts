import { act, renderHook } from '@testing-library/react';
import { useEffect } from 'react';
import { describe, expect, it } from 'vitest';
import type {
  Capabilities, DataChannelEntry, GraphqlResult, SelectorItem,
} from '../src/index.js';
import { createMockHost } from '../src/testing/index.js';
import { pushOf, triggerOf } from './ready.js';
import type { MockHost } from '../src/testing/index.js';

const QUERY = 'subscription First { first }';
const OTHER_QUERY = 'subscription Second { second }';
const MUTATION = 'mutation Example($value: String!) { example(value: $value) }';
const OTHER_MUTATION = 'mutation Other($value: String!) { other(value: $value) }';

const entry = (entryId: string): DataChannelEntry<unknown> => ({
  entryId,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  createdBy: 'user-1',
  channelName: 'channel',
  subChannelName: 'sub',
  pluginName: 'mock-plugin',
  toRoles: [],
  payloadJson: { entryId },
});

const capabilities: Capabilities = {
  mediaGroupAudioRouting: true,
  mediaGroupCameraRouting: true,
  inBreakout: true,
  placements: { actionsSheet: 1 },
};

const selector: SelectorItem = {
  type: 'selector',
  id: 'layout',
  icon: 'settings',
  label: 'Layout',
  value: '',
  options: [{ value: '', label: 'None' }],
  onChange: () => {},
};

describe('mock host reads', () => {
  it.each<[string, (mock: MockHost) => () => unknown, (mock: MockHost) => unknown]>([
    ['setCurrentUser', ({ host }) => () => host.useCurrentUser(), ({ controller }) => {
      const result = {
        loading: false,
        data: {
          userId: 'u2', extId: 'e2', name: 'Other', role: 'MODERATOR', presenter: true,
        },
      };
      controller.setCurrentUser(result);
      return result;
    }],
    ['setUsersBasicInfo', ({ host }) => () => host.useUsersBasicInfo(), ({ controller }) => {
      const result = { loading: false, data: { user: [] } };
      controller.setUsersBasicInfo(result);
      return result;
    }],
    ['setPluginSettings', ({ host }) => () => host.usePluginSettings(), ({ controller }) => {
      const result = { loading: false, data: { key: 'value' } };
      controller.setPluginSettings(result);
      return result;
    }],
    ['setCapabilities', ({ host }) => () => host.useCapabilities(), ({ controller }) => {
      controller.setCapabilities(capabilities);
      return capabilities;
    }],
    ['setSubscriptionResult', ({ host }) => () => host.useCustomSubscription(QUERY), ({
      controller,
    }) => {
      const result = { loading: false, data: { first: 1 } };
      controller.setSubscriptionResult(QUERY, result);
      return result;
    }],
    ['setDataChannelEntries', ({ host }) => () => (
      host.useDataChannel('channel', undefined, 'sub').data
    ), ({ controller }) => {
      const result = { loading: false, data: [entry('e1')] };
      controller.setDataChannelEntries('channel', result, 'sub');
      return result;
    }],
  ])('re-renders a mounted hook after %s', (_name, hook, set) => {
    const mock = createMockHost();
    const { result } = renderHook(hook(mock));
    let expected: unknown;
    act(() => { expected = set(mock); });
    expect(result.current).toBe(expected);
  });

  it('keys data-channel entries by channel and sub-channel', () => {
    const { host, controller } = createMockHost();
    const set = { loading: false, data: [entry('e1')] };
    const named = renderHook(() => host.useDataChannel('channel', undefined, 'sub'));
    const unnamed = renderHook(() => host.useDataChannel('channel'));
    const otherChannel = renderHook(() => host.useDataChannel('other', undefined, 'sub'));
    act(() => controller.setDataChannelEntries('channel', set, 'sub'));
    expect(named.result.current.data).toBe(set);
    expect(unnamed.result.current.data).toEqual({ loading: true });
    expect(otherChannel.result.current.data).toEqual({ loading: true });
  });

  it('keys custom subscription results by query text', () => {
    const { host, controller } = createMockHost();
    const set = { loading: false, data: { first: 1 } };
    const first = renderHook(() => host.useCustomSubscription(QUERY, { variables: { a: 1 } }));
    const second = renderHook(() => host.useCustomSubscription(OTHER_QUERY));
    act(() => controller.setSubscriptionResult(QUERY, set));
    expect(first.result.current).toBe(set);
    expect(second.result.current).toEqual({ loading: true });
  });

  it('keeps hook results, the data channel and the trigger the same across renders', () => {
    const { host } = createMockHost();
    let effects = 0;
    const { result, rerender } = renderHook(() => {
      const channel = host.useDataChannel('channel', undefined, 'sub');
      const [trigger, state] = host.useCustomMutation(MUTATION);
      const parts = [
        channel, channel.pushEntry, trigger, state, host.useCurrentUser(), host.useLocale(),
      ] as const;
      useEffect(() => { effects += 1; }, parts);
      return parts;
    });
    const first = result.current;
    rerender();
    rerender();
    result.current.forEach((part, index) => expect(part).toBe(first[index]));
    expect(effects).toBe(1);
  });

  it('gives a copy of every list, taken when it is read', async () => {
    const { host, controller } = createMockHost();
    const lists = [
      'subscriptions', 'mutations', 'dataChannelWrites', 'actionsSheetItems', 'openedSelectors',
      'dialogs', 'notices', 'logs',
    ] as const;
    const before = lists.map((name) => controller[name]);
    const { result } = renderHook(() => ({
      subscription: host.useCustomSubscription(QUERY),
      channel: host.useDataChannel('channel', undefined, 'sub'),
      mutation: host.useCustomMutation(MUTATION),
    }));
    await act(async () => {
      await triggerOf(result.current.mutation)({ variables: { value: 'a' } });
    });
    pushOf(result.current.channel)(1);
    host.setActionsSheetItems([selector]);
    host.openSelector('layout');
    host.dialogs.info({ id: 'info', title: 'Info', body: 'Body' });
    host.notify({ message: 'hello' });
    host.logger.info({ logCode: 'mock_test' }, 'message');
    before.forEach((list) => expect(list).toEqual([]));
    lists.forEach((name) => expect(controller[name]).toHaveLength(1));
  });

  it('keeps the actions sheet items it was given, not the caller list', () => {
    const { host, controller } = createMockHost();
    const items = [selector];
    host.setActionsSheetItems(items);
    items.push({ ...selector, id: 'second' });
    expect(controller.actionsSheetItems).toEqual([selector]);
    host.setActionsSheetItems([]);
    expect(controller.actionsSheetItems).toEqual([]);
  });

  it('records push receivers and replace writes', () => {
    const { host, controller } = createMockHost();
    const { result } = renderHook(() => host.useDataChannel<number>('channel', undefined, 'sub'));
    pushOf(result.current)(1, { receivers: [{ userId: 'u1' }, { role: 'MODERATOR' }] });
    result.current.replaceEntry('e1', 2);
    expect(controller.dataChannelWrites).toEqual([
      {
        channelName: 'channel',
        subChannelName: 'sub',
        type: 'push',
        payload: 1,
        receivers: [{ userId: 'u1' }, { role: 'MODERATOR' }],
      },
      {
        channelName: 'channel', subChannelName: 'sub', type: 'replace', entryId: 'e1', payload: 2,
      },
    ]);
  });

  it('fails only the mutation given to setMutationError, until it is cleared', async () => {
    const { host, controller } = createMockHost();
    const failure = new Error('refused');
    const failing = renderHook(() => host.useCustomMutation<{ value: string }>(MUTATION));
    const other = renderHook(() => host.useCustomMutation<{ value: string }>(OTHER_MUTATION));
    controller.setMutationError(MUTATION, failure);
    await act(async () => {
      await triggerOf(failing.result.current)({ variables: { value: 'a' } });
    });
    await act(async () => {
      await triggerOf(other.result.current)({ variables: { value: 'b' } });
    });
    expect(failing.result.current[1].error).toBe(failure);
    expect(other.result.current[1]).toEqual({ loading: false });
    expect(controller.mutations.map((call) => call.mutation)).toEqual([MUTATION, OTHER_MUTATION]);
    controller.setMutationError(MUTATION, undefined);
    await act(async () => {
      await triggerOf(failing.result.current)({ variables: { value: 'c' } });
    });
    expect(failing.result.current[1]).toEqual({ loading: false });
    expect(controller.logs.map((log) => log.record.logCode)).toEqual(['mock_host_mutation_failed']);
  });

  it('uses the pluginName and hostApiVersion options', () => {
    const { host } = createMockHost({ pluginName: 'named-plugin', hostApiVersion: '9.8.7' });
    expect([host.pluginName, host.hostApiVersion]).toEqual(['named-plugin', '9.8.7']);
  });

  it('starts from the defaults it documents', () => {
    const { host } = createMockHost();
    const { result } = renderHook(() => ({
      currentUser: host.useCurrentUser(),
      settings: host.usePluginSettings(),
      locale: host.useLocale(),
      capabilities: host.useCapabilities(),
      subscription: host.useCustomSubscription(QUERY),
      channel: host.useDataChannel('channel').data,
    }));
    const loading: GraphqlResult<never> = { loading: true };
    expect(result.current).toEqual({
      currentUser: {
        loading: false,
        data: {
          userId: 'mock-user-id',
          extId: 'mock-ext-id',
          name: 'Mock User',
          role: 'VIEWER',
          presenter: false,
        },
      },
      settings: { loading: false, data: {} },
      locale: 'en',
      capabilities: {
        mediaGroupAudioRouting: false,
        mediaGroupCameraRouting: false,
        inBreakout: false,
        placements: {},
      },
      subscription: loading,
      channel: loading,
    });
  });

  it('records each log record at its level, and every notice and opened selector', () => {
    const { host, controller } = createMockHost();
    (['debug', 'info', 'warn', 'error'] as const).forEach((level) => {
      host.logger[level]({ logCode: `mock_${level}`, extraInfo: { level } }, level);
    });
    host.notify({ message: 'first' });
    host.notify({ message: 'second', level: 'error', sticky: true });
    host.setActionsSheetItems([{ ...selector, id: 'a' }, { ...selector, id: 'b' }]);
    host.openSelector('a');
    host.openSelector('b');
    expect(controller.logs).toEqual((['debug', 'info', 'warn', 'error'] as const).map((level) => ({
      level, record: { logCode: `mock_${level}`, extraInfo: { level } }, message: level,
    })));
    expect(controller.notices).toEqual([
      { message: 'first' },
      { message: 'second', level: 'error', sticky: true },
    ]);
    expect(controller.openedSelectors).toEqual(['a', 'b']);
  });
});
