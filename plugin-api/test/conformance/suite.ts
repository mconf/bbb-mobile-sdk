import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { MobilePluginHost } from '../../src/index.js';

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
}

const SEMVER = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$/;
const MUTATION = 'mutation Conformance($value: String!) { conformance(value: $value) }';

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
    });

    describe('host API range', () => {
      it.todo('loads a plugin whose caret, tilde, x-range, exact or || range matches the host version');
      it.todo('skips and logs a plugin whose range does not match the host version');
      it.todo('lets a pre-release host version satisfy only a range naming a pre-release of the same major.minor.patch');
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
      it('resolves when the mutation was sent', async () => {
        const harness = createHarness();
        const { result } = renderHook(() => harness.host.useCustomMutation<{ value: string }>(MUTATION));
        await act(async () => {
          await expect(result.current[0]({ variables: { value: 'a' } })).resolves.toBeUndefined();
        });
        expect(result.current[1].error).toBeUndefined();
      });

      it('never rejects: a failure is logged and shows in the mutation state', async () => {
        const harness = createHarness();
        const failure = new Error('refused');
        harness.failMutation(MUTATION, failure);
        const { result } = renderHook(() => harness.host.useCustomMutation<{ value: string }>(MUTATION));
        const errorsBefore = harness.errorLogCount();
        await act(async () => {
          await expect(result.current[0]({ variables: { value: 'a' } })).resolves.toBeUndefined();
        });
        expect(harness.errorLogCount()).toBe(errorsBefore + 1);
        expect(result.current[1].error).toBe(failure);
      });
    });

    describe('data channel', () => {
      it.todo('returns entries newest first, with ties broken by entry id');
      it.todo('returns only entries created after the subscription in the new-items mode');
    });

    describe('dialogs', () => {
      it('keeps every dialog asked for, in order', () => {
        const harness = createHarness();
        harness.host.dialogs.info({ id: 'first', title: 'First', body: 'Body' });
        harness.host.dialogs.confirm({ id: 'second', title: 'Second', body: ['Body'], actions: [] });
        expect(harness.dialogIds()).toEqual(['first', 'second']);
      });

      it('closes only the dialog with the given id', () => {
        const harness = createHarness();
        harness.host.dialogs.info({ id: 'first', title: 'First', body: 'Body' });
        harness.host.dialogs.info({ id: 'second', title: 'Second', body: 'Body' });
        harness.host.dialogs.close('first');
        expect(harness.dialogIds()).toEqual(['second']);
      });

      it.todo('shows a queued dialog only after the one before it closes');
      it.todo('drops a confirm dialog whose isStillRelevant returns false when its turn comes');
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
