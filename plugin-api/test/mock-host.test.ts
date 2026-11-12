import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type {
  ActionsSheetItem, DataChannelEntry, DialogAction, SelectorItem,
} from '../src/index.js';
import { createMockHost } from '../src/testing/index.js';
import { pushOf, triggerOf } from './ready.js';

const MUTATION = 'mutation Example($value: String!) { example(value: $value) }';
const OK_ACTION: DialogAction = { label: 'OK', kind: 'primary', onPress: () => {} };

const selector = (id: string, label = id): SelectorItem => ({
  type: 'selector',
  id,
  icon: 'translate',
  label,
  value: '',
  options: [{ value: '', label: 'None' }],
  onChange: () => {},
});

const entry = (entryId: string, subChannelName: string): DataChannelEntry<unknown> => ({
  entryId,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  createdBy: 'user-1',
  channelName: 'channel',
  subChannelName,
  pluginName: 'mock-plugin',
  toRoles: [],
  payloadJson: { entryId },
});

describe('mock host', () => {
  it('shows a mutation as loading while it is being sent', async () => {
    const { host } = createMockHost();
    const { result } = renderHook(() => host.useCustomMutation<{ value: string }>(MUTATION));
    let sent: Promise<void> = Promise.resolve();
    act(() => { sent = triggerOf(result.current)({ variables: { value: 'a' } }); });
    expect(result.current[1].loading).toBe(true);
    await act(async () => { await sent; });
    expect(result.current[1]).toEqual({ loading: false });
  });

  it('keeps the mutation state of each hook apart', async () => {
    const { host, controller } = createMockHost();
    const failure = new Error('refused');
    const first = renderHook(() => host.useCustomMutation<{ value: string }>(MUTATION));
    const second = renderHook(() => host.useCustomMutation<{ value: string }>(MUTATION));
    controller.setMutationError(MUTATION, failure);
    await act(async () => {
      await triggerOf(first.result.current)({ variables: { value: 'a' } });
    });
    expect(first.result.current[1].error).toBe(failure);
    expect(second.result.current[1].error).toBeUndefined();
  });

  it('records every mutation sent, with its variables', async () => {
    const { host, controller } = createMockHost();
    const { result } = renderHook(() => host.useCustomMutation<{ value: string }>(MUTATION));
    await act(async () => { await triggerOf(result.current)({ variables: { value: 'a' } }); });
    expect(controller.mutations).toEqual([{ mutation: MUTATION, variables: { value: 'a' } }]);
  });

  it('gives copies of its lists, taken when they are read', () => {
    const { host, controller } = createMockHost();
    const before = controller.notices;
    host.notify({ message: 'hello' });
    expect(before).toEqual([]);
    expect(controller.notices).toEqual([{ message: 'hello' }]);
  });

  it('records data-channel writes with their channel', () => {
    const { host, controller } = createMockHost();
    const { result } = renderHook(() => host.useDataChannel<{ seen: boolean }>('channel', undefined, 'sub'));
    pushOf(result.current)({ seen: true });
    result.current.deleteEntry(['entry-1']);
    expect(controller.dataChannelWrites).toEqual([
      {
        channelName: 'channel', subChannelName: 'sub', type: 'push', payload: { seen: true },
      },
      {
        channelName: 'channel', subChannelName: 'sub', type: 'delete', entryIds: ['entry-1'],
      },
    ]);
  });

  it('fails only the calls made after setMutationError', async () => {
    const { host, controller } = createMockHost();
    const failure = new Error('refused');
    const { result } = renderHook(() => host.useCustomMutation<{ value: string }>(MUTATION));
    let inFlight: Promise<void> = Promise.resolve();
    act(() => { inFlight = triggerOf(result.current)({ variables: { value: 'a' } }); });
    controller.setMutationError(MUTATION, failure);
    await act(async () => { await inFlight; });
    expect(result.current[1]).toEqual({ loading: false });
    expect(controller.logs).toEqual([]);
    await act(async () => { await triggerOf(result.current)({ variables: { value: 'b' } }); });
    expect(result.current[1].error).toBe(failure);
  });

  it('records the variables as they were when the mutation was sent', async () => {
    const { host, controller } = createMockHost();
    const { result } = renderHook(() => host.useCustomMutation<{ list: number[] }>(MUTATION));
    const variables = { list: [1] };
    await act(async () => { await triggerOf(result.current)({ variables }); });
    variables.list.push(2);
    expect(controller.mutations).toEqual([{ mutation: MUTATION, variables: { list: [1] } }]);
  });

  it('lists the current user among the users by default', () => {
    const { host } = createMockHost();
    const current = renderHook(() => host.useCurrentUser()).result.current.data;
    const users = renderHook(() => host.useUsersBasicInfo()).result.current.data?.user;
    expect(users?.map((user) => [user.userId, user.extId, user.name, user.bot]))
      .toEqual([[current?.userId, current?.extId, current?.name, false]]);
  });

  it("reads the 'default' sub-channel when none is named", () => {
    const { host, controller } = createMockHost();
    const named = { loading: false, data: [entry('named', 'default')] };
    const unnamed = { loading: false, data: [entry('unnamed', 'default')] };
    const omitted = renderHook(() => host.useDataChannel('channel'));
    act(() => controller.setDataChannelEntries('channel', named, 'default'));
    expect(omitted.result.current.data).toBe(named);
    const explicit = renderHook(() => host.useDataChannel('channel', undefined, 'default'));
    act(() => controller.setDataChannelEntries('channel', unnamed));
    expect(explicit.result.current.data).toBe(unnamed);
    expect(omitted.result.current.data).toBe(unnamed);
  });

  it("records a write with no sub-channel on the 'default' sub-channel", () => {
    const { host, controller } = createMockHost();
    const { result } = renderHook(() => host.useDataChannel<number>('channel'));
    pushOf(result.current)(1);
    result.current.replaceEntry('entry-1', 2);
    result.current.deleteEntry(['entry-1']);
    expect(controller.dataChannelWrites).toEqual([
      {
        channelName: 'channel', subChannelName: 'default', type: 'push', payload: 1,
      },
      {
        channelName: 'channel',
        subChannelName: 'default',
        type: 'replace',
        entryId: 'entry-1',
        payload: 2,
      },
      {
        channelName: 'channel', subChannelName: 'default', type: 'delete', entryIds: ['entry-1'],
      },
    ]);
  });

  it('keeps what a replacing dialog says, at the place of the one it replaces', () => {
    const { host, controller } = createMockHost();
    host.dialogs.info({ id: 'first', title: 'First', body: 'Body' });
    host.dialogs.info({ id: 'second', title: 'Second', body: 'Body' });
    const replacement = {
      id: 'first', title: 'Replaced', body: ['Body'], actions: [OK_ACTION] as const,
    };
    host.dialogs.confirm(replacement);
    expect(controller.dialogs.map((entry) => entry.dialog.title)).toEqual(['Replaced', 'Second']);
    expect(controller.dialogs[0]).toEqual({ kind: 'confirm', dialog: replacement });
  });

  it('presses a button of the shown dialog once, and refuses any other press', () => {
    const { host, controller } = createMockHost();
    let presses = 0;
    host.dialogs.info({ id: 'info', title: 'Info', body: 'Body' });
    host.dialogs.confirm({
      id: 'ask',
      title: 'Ask',
      body: ['Body'],
      actions: [{ label: 'OK', kind: 'primary', onPress: () => { presses += 1; } }],
    });
    expect(() => controller.pressDialogAction('info', 0)).toThrow(Error);
    expect(() => controller.pressDialogAction('ask', 0)).toThrow(Error);
    expect(presses).toBe(0);
    host.dialogs.close('info');
    expect(() => controller.pressDialogAction('ask', 1)).toThrow(Error);
    expect(() => controller.pressDialogAction('none', 0)).toThrow(Error);
    controller.pressDialogAction('ask', 0);
    expect(presses).toBe(1);
    expect(controller.dialogs).toEqual([]);
    expect(() => controller.pressDialogAction('ask', 0)).toThrow(Error);
  });

  it('keeps the first item with an id, and logs and drops the later ones', () => {
    const { host, controller } = createMockHost();
    host.setActionsSheetItems([selector('a', 'First'), selector('b'), selector('a', 'Second')]);
    expect(controller.actionsSheetItems.map((item) => [item.id, item.label]))
      .toEqual([['a', 'First'], ['b', 'b']]);
    expect(controller.logs.map((entry) => [entry.level, entry.record.logCode]))
      .toEqual([['warn', 'mock_host_repeated_item_id']]);
  });

  it('opens only a selector item that exists and is not pending', () => {
    const { host, controller } = createMockHost();
    // An item of a type this contract does not have, as a newer plugin could send.
    const other = { type: 'other', id: 'other' } as unknown as ActionsSheetItem;
    host.setActionsSheetItems([selector('ready'), { ...selector('busy'), pending: true }, other]);
    host.openSelector('missing');
    host.openSelector('busy');
    host.openSelector('other');
    host.openSelector('ready');
    expect(controller.openedSelectors).toEqual(['ready']);
    expect(controller.logs.map((entry) => [entry.level, entry.record.logCode, entry.message])).toEqual([
      ['warn', 'mock_host_selector_not_opened', 'No selector item has this id'],
      ['warn', 'mock_host_selector_not_opened', 'The selector item is pending'],
      ['warn', 'mock_host_selector_not_opened', 'No selector item has this id'],
    ]);
  });

  it('records a subscription on mount and on each change of its arguments', () => {
    const { host, controller } = createMockHost();
    const query = 'subscription Example($a: Int, $b: Int) { example(a: $a, b: $b) }';
    const initialProps: { text: string; variables: Record<string, unknown> } = {
      text: query, variables: { a: 1, b: { c: 1, d: 2 } },
    };
    const { rerender } = renderHook(
      ({ text, variables }) => host.useCustomSubscription(text, { variables }),
      { initialProps },
    );
    rerender({ text: query, variables: { a: 1, b: { c: 1, d: 2 } } });
    rerender({ text: query, variables: { b: { c: 1, d: 2 }, a: 1, e: undefined } });
    expect(controller.subscriptions).toHaveLength(1);
    rerender({ text: query, variables: { a: 1, b: { d: 2, c: 1 } } });
    rerender({ text: `${query} `, variables: { a: 1, b: { d: 2, c: 1 } } });
    expect(controller.subscriptions).toEqual([
      { query, variables: { a: 1, b: { c: 1, d: 2 } } },
      { query, variables: { a: 1, b: { d: 2, c: 1 } } },
      { query: `${query} `, variables: { a: 1, b: { d: 2, c: 1 } } },
    ]);
  });

  it('tells no variables apart from empty variables', () => {
    const { host, controller } = createMockHost();
    const query = 'subscription Example { example }';
    const { rerender } = renderHook(
      ({ variables }) => host.useCustomSubscription(query, { variables }),
      { initialProps: { variables: undefined as Record<string, unknown> | undefined } },
    );
    rerender({ variables: {} });
    expect(controller.subscriptions).toEqual([
      { query, variables: undefined },
      { query, variables: {} },
    ]);
  });
});
