import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { DataChannelEntry, DialogAction } from '../src/index.js';
import { createMockHost } from '../src/testing/index.js';

const MUTATION = 'mutation Example($value: String!) { example(value: $value) }';
const OK_ACTION: DialogAction = { label: 'OK', kind: 'primary', onPress: () => {} };

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
    act(() => { sent = result.current[0]({ variables: { value: 'a' } }); });
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
    await act(async () => { await first.result.current[0]({ variables: { value: 'a' } }); });
    expect(first.result.current[1].error).toBe(failure);
    expect(second.result.current[1].error).toBeUndefined();
  });

  it('records every mutation sent, with its variables', async () => {
    const { host, controller } = createMockHost();
    const { result } = renderHook(() => host.useCustomMutation<{ value: string }>(MUTATION));
    await act(async () => { await result.current[0]({ variables: { value: 'a' } }); });
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
    result.current.pushEntry({ seen: true });
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
    act(() => { inFlight = result.current[0]({ variables: { value: 'a' } }); });
    controller.setMutationError(MUTATION, failure);
    await act(async () => { await inFlight; });
    expect(result.current[1]).toEqual({ loading: false });
    expect(controller.logs).toEqual([]);
    await act(async () => { await result.current[0]({ variables: { value: 'b' } }); });
    expect(result.current[1].error).toBe(failure);
  });

  it('records the variables as they were when the mutation was sent', async () => {
    const { host, controller } = createMockHost();
    const { result } = renderHook(() => host.useCustomMutation<{ list: number[] }>(MUTATION));
    const variables = { list: [1] };
    await act(async () => { await result.current[0]({ variables }); });
    variables.list.push(2);
    expect(controller.mutations).toEqual([{ mutation: MUTATION, variables: { list: [1] } }]);
  });

  it('lists the current user among the users by default', () => {
    const { host } = createMockHost();
    const current = renderHook(() => host.useCurrentUser()).result.current.data;
    const users = renderHook(() => host.useUsersBasicInfo()).result.current.data?.user;
    expect(users?.map((user) => [user.userId, user.extId, user.name]))
      .toEqual([[current?.userId, current?.extId, current?.name]]);
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
    result.current.pushEntry(1);
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
});
