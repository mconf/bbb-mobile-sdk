import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { DialogAction, MobilePluginHost } from '../../src/index.js';
import { triggerOf } from '../ready.js';

/**
 * What the conformance suite needs from the host under test, besides the host itself.
 * Each kind of host (the mock host, the SDK's host) provides its own harness.
 */
export interface HostHarness {
  host: MobilePluginHost;
  /** Changes the app language to a BCP 47 tag. */
  setLocale(locale: string): void;
  /** Makes later calls of this mutation fail. */
  failMutation(mutation: string, error: unknown): void;
  /** How many error records the plugin's logger has received. */
  errorLogCount(): number;
  /** The ids of the dialogs shown or queued, in order. */
  dialogIds(): readonly string[];
  /** Presses a button of the shown confirm dialog with this id, as the user would. */
  pressDialogAction(id: string, actionIndex: number): void;
}

const SEMVER = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$/;
const MUTATION = 'mutation Conformance($value: String!) { conformance(value: $value) }';
const OK_ACTION: DialogAction = { label: 'OK', kind: 'primary', onPress: () => {} };

/**
 * The cases every host must pass. A case that needs host code that does not exist yet
 * is listed as `it.todo`, so the list shows what the contract promises.
 */
export function describeHostConformance(name: string, createHarness: () => HostHarness): void {
  describe(`host conformance: ${name}`, () => {
    describe('identity', () => {
      it('reports its host API version as a semver version', () => {
        const { host } = createHarness();
        expect(host.hostApiVersion).toMatch(SEMVER);
      });

      it('gives the plugin its name', () => {
        const { host } = createHarness();
        expect(typeof host.pluginName).toBe('string');
        expect(host.pluginName.trim()).not.toBe('');
      });

      it.todo("gives the plugin the definition's name as pluginName");
    });

    describe('host API range', () => {
      it.todo('loads a plugin whose caret, tilde, x-range, exact or || range matches the host version');
      it.todo('skips and logs a plugin whose range does not match the host version');
      it.todo('lets a pre-release host version satisfy only a range naming a pre-release of the same major.minor.patch');
    });

    describe('users', () => {
      it.todo('lists every user in the meeting, bots included, with bot set on each bot');
    });

    describe('locale', () => {
      it('updates when the app language changes', () => {
        const harness = createHarness();
        const { result } = renderHook(() => harness.host.useLocale());
        act(() => harness.setLocale('pt-BR'));
        expect(result.current).toBe('pt-BR');
        act(() => harness.setLocale('es'));
        expect(result.current).toBe('es');
      });

      it.todo('turns an app language written with an underscore (pt_BR) into a BCP 47 tag (pt-BR)');
    });

    describe('settings', () => {
      it.todo('serves the plugin settings from the copy loaded at join, with no new subscription');
    });

    describe('custom mutation', () => {
      it.todo('sets the trigger only once it can send the mutation');

      it('resolves when the mutation was sent', async () => {
        const harness = createHarness();
        const { result } = renderHook(() => harness.host.useCustomMutation<{ value: string }>(MUTATION));
        await waitFor(() => expect(result.current[0]).not.toBeNull());
        await act(async () => {
          await expect(triggerOf(result.current)({ variables: { value: 'a' } })).resolves.toBeUndefined();
        });
        expect(result.current[1].error).toBeUndefined();
      });

      it('never rejects: a failure is logged and shows in the mutation state', async () => {
        const harness = createHarness();
        const failure = new Error('refused');
        harness.failMutation(MUTATION, failure);
        const { result } = renderHook(() => harness.host.useCustomMutation<{ value: string }>(MUTATION));
        await waitFor(() => expect(result.current[0]).not.toBeNull());
        const errorsBefore = harness.errorLogCount();
        await act(async () => {
          await expect(triggerOf(result.current)({ variables: { value: 'a' } })).resolves.toBeUndefined();
        });
        await waitFor(() => expect(harness.errorLogCount()).toBe(errorsBefore + 1));
        expect(result.current[1].error).toBe(failure);
      });

      it.each([
        ['succeeded', undefined],
        ['failed', new Error('refused')],
      ])('turns loading false only once it knows the call %s, and sets error with it', async (_outcome, failure) => {
        const harness = createHarness();
        if (failure !== undefined) harness.failMutation(MUTATION, failure);
        const { result } = renderHook(() => harness.host.useCustomMutation<{ value: string }>(MUTATION));
        await waitFor(() => expect(result.current[0]).not.toBeNull());
        await act(async () => {
          await triggerOf(result.current)({ variables: { value: 'a' } });
        });
        await waitFor(() => expect(result.current[1].loading).toBe(false));
        expect(result.current[1].error).toBe(failure);
      });
    });

    describe('data channel', () => {
      it.todo('sets pushEntry only once it can write, and drops a replace or delete made before then with a debug log');
      it.todo('returns entries newest first by createdAt');
      it.todo('stays loading until the first data or an error, and never returns an empty list before it');
      it.todo('delivers every entry on each update in the all-items mode');
      it.todo('delivers every entry first, then only the entries each update added or replaced, in the latest-item mode');
      it.todo("delivers the channel's newest entry after any delete in the latest-item mode");
      it.todo('delivers only entries created at or after the moment the hook subscribed, by the device clock, in the new-items mode');
      it.todo('delivers nothing for a delete that leaves entries in the channel, in the new-items mode');
      it.todo('delivers an empty list on a reset, or when deletes empty the channel, in the latest-item and new-items modes');
      it.todo("shares one reader among the hooks of a plugin that read one channel, sub-channel and mode: a later hook gets the last delivery and the first hook's subscribe time");
      it.todo('sends nothing to the hooks already mounted when another hook of the same reader mounts');
    });

    describe('actions sheet', () => {
      it.todo('keeps the first item with an id, and logs and drops each later item with that id');
      it.todo('opens a selector even when the actions sheet is closed');
      it.todo('logs and ignores openSelector for an id with no selector item, or a pending one');
    });

    describe('dialogs', () => {
      it('keeps every dialog asked for, in order', () => {
        const harness = createHarness();
        harness.host.dialogs.info({ id: 'first', title: 'First', body: 'Body' });
        harness.host.dialogs.confirm({
          id: 'second', title: 'Second', body: ['Body'], actions: [OK_ACTION],
        });
        expect(harness.dialogIds()).toEqual(['first', 'second']);
      });

      it('drops a confirm dialog with no buttons or no actions list and logs an error', () => {
        const harness = createHarness();
        const errorsBefore = harness.errorLogCount();
        harness.host.dialogs.confirm({
          id: 'empty',
          title: 'Empty',
          body: ['Body'],
          // @ts-expect-error The type needs a button; a plugin that bypasses the type can send none.
          actions: [],
        });
        // @ts-expect-error The type needs actions; a plugin that bypasses the type can leave them out.
        harness.host.dialogs.confirm({ id: 'missing', title: 'Missing', body: ['Body'] });
        expect(harness.dialogIds()).toEqual([]);
        expect(harness.errorLogCount()).toBe(errorsBefore + 2);
      });

      it('replaces a dialog shown or queued with the same id in place', () => {
        const harness = createHarness();
        const pressed: string[] = [];
        const ask = (id: string, label: string): void => harness.host.dialogs.confirm({
          id,
          title: id,
          body: ['Body'],
          actions: [{ label, kind: 'primary', onPress: () => { pressed.push(label); } }],
        });
        ask('first', 'A');
        ask('second', 'B');
        harness.host.dialogs.info({ id: 'third', title: 'Third', body: 'Body' });
        ask('second', 'C');
        ask('first', 'D');
        expect(harness.dialogIds()).toEqual(['first', 'second', 'third']);
        harness.pressDialogAction('first', 0);
        harness.pressDialogAction('second', 0);
        expect(pressed).toEqual(['D', 'C']);
      });

      it('closes the dialog before it calls the pressed action', () => {
        const harness = createHarness();
        const seen: (readonly string[])[] = [];
        harness.host.dialogs.confirm({
          id: 'ask',
          title: 'Ask',
          body: ['Body'],
          actions: [
            OK_ACTION,
            { label: 'Not now', kind: 'link', onPress: () => { seen.push(harness.dialogIds()); } },
          ],
        });
        harness.pressDialogAction('ask', 1);
        expect(seen).toEqual([[]]);
        expect(harness.dialogIds()).toEqual([]);
      });

      it('closes only the dialog with the given id, shown or queued', () => {
        const harness = createHarness();
        harness.host.dialogs.info({ id: 'first', title: 'First', body: 'Body' });
        harness.host.dialogs.info({ id: 'second', title: 'Second', body: 'Body' });
        harness.host.dialogs.info({ id: 'third', title: 'Third', body: 'Body' });
        harness.host.dialogs.close('second');
        expect(harness.dialogIds()).toEqual(['first', 'third']);
        harness.host.dialogs.close('first');
        expect(harness.dialogIds()).toEqual(['third']);
      });

      it.todo('shows a queued dialog only after the one before it closes');
      it.todo('drops a confirm dialog whose isStillRelevant returns false when its turn comes');
      it.todo('closes a dialog the user dismisses without a button, and calls no action');
    });

    describe('notices', () => {
      it.todo('shows a plugin notice after an app notice, never in its place');
    });

    describe('logger', () => {
      it('accepts a record at every level', () => {
        const { host } = createHarness();
        (['debug', 'info', 'warn', 'error'] as const).forEach((level) => {
          expect(() => host.logger[level]({ logCode: 'conformance_log' }, 'message')).not.toThrow();
        });
      });
    });
  });
}
