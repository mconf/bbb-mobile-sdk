import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  HOST_API_VERSION,
  definePlugin,
  type DialogAction,
  type GraphqlResult,
  type MobilePluginDefinition,
  type MobilePluginHost,
} from '../../src/index.js';
import { triggerOf } from '../ready.js';

/**
 * What the conformance suite needs from the host under test, besides the host itself.
 * The mock host, and a variant of it that reports mutation failures late, provide the
 * harnesses today. A harness for the SDK's host comes with the host code, and may need more
 * than this interface has.
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
  /**
   * Gives the subscription with this query and these variables a result. The host may
   * pass it only to a subscription already started, and only as data or an error.
   */
  setSubscriptionResult?(
    query: string,
    variables: Record<string, unknown> | undefined,
    result: GraphqlResult<unknown>,
  ): void;
  /** How many times the host subscribed to this query text. */
  subscriptionCount?(query: string): number;
  /** Lets the host send mutations, or stops it. */
  setCanSend?(canSend: boolean): void;
  /** The host of a second plugin in the same app. */
  otherPluginHost?(): MobilePluginHost;
}

const SEMVER = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$/;
const MUTATION = 'mutation Conformance($value: String!) { conformance(value: $value) }';
const OTHER_MUTATION = 'mutation Other($value: String!) { other(value: $value) }';
const OK_ACTION: DialogAction = { label: 'OK', kind: 'primary', onPress: () => {} };
const QUERY = 'subscription Conformance($id: Int) { conformance(id: $id) { value } }';

// A harness member a case needs. A case fails on a harness that lacks it, so that
// harness lists the case in `skip`.
const member = <K extends keyof HostHarness>(harness: HostHarness, key: K): NonNullable<HostHarness[K]> => {
  const value = harness[key];
  if (value === undefined) throw new Error(`the harness has no ${String(key)}`);
  return value as NonNullable<HostHarness[K]>;
};

/** The groups of cases in {@link describeHostConformance}. */
export const CONFORMANCE_GROUPS = [
  'identity', 'users', 'locale', 'settings', 'custom subscription', 'custom mutation',
  'data channel', 'actions sheet', 'dialogs', 'notices', 'logger',
] as const;

export type ConformanceGroup = (typeof CONFORMANCE_GROUPS)[number];

/**
 * The cases every host must pass. A case that needs host code that does not exist yet
 * is listed as `it.todo`, so the list shows what the contract promises.
 *
 * @param groups - The groups whose members the host provides; the others are skipped.
 * @param skip - Cases, by title, that the host does not pass; each is skipped. Only the
 *   cases that need an optional harness member can be skipped this way.
 */
export function describeHostConformance(
  name: string,
  createHarness: () => HostHarness,
  groups: readonly ConformanceGroup[] = CONFORMANCE_GROUPS,
  skip: readonly string[] = [],
): void {
  const group = (title: ConformanceGroup, body: () => void): void => {
    (groups.includes(title) ? describe : describe.skip)(title, body);
  };
  const testCase = (title: string, body: () => void | Promise<void>): void => {
    (skip.includes(title) ? it.skip : it)(title, body);
  };

  describe(`host conformance: ${name}`, () => {
    group('identity', () => {
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

    group('users', () => {
      it.todo('lists every user in the meeting, bots included, with bot set on each bot');
    });

    group('locale', () => {
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

    group('settings', () => {
      it.todo('serves the plugin settings from the copy loaded at join, with no new subscription');
    });

    group('custom subscription', () => {
      const watch = (harness: HostHarness, variables: Record<string, unknown>, query = QUERY) => {
        const seen: GraphqlResult<unknown>[] = [];
        const view = renderHook((props: { query: string; variables: Record<string, unknown> }) => {
          const result = harness.host.useCustomSubscription(props.query, { variables: props.variables });
          seen.push(result);
          return result;
        }, { initialProps: { query, variables } });
        return { ...view, seen };
      };

      testCase('subscribes again only when the query text, or the variables JSON with sorted top-level keys, changes', () => {
        const harness = createHarness();
        const count = member(harness, 'subscriptionCount');
        const view = watch(harness, { a: 1, b: 2 });
        expect(count(QUERY)).toBe(1);
        view.rerender({ query: QUERY, variables: { b: 2, a: 1 } });
        expect(count(QUERY)).toBe(1);
        view.rerender({ query: QUERY, variables: { a: 1, b: 3 } });
        expect(count(QUERY)).toBe(2);
        view.rerender({ query: `${QUERY} `, variables: { a: 1, b: 3 } });
        expect(count(`${QUERY} `)).toBe(1);
      });

      testCase('returns the previous result, then loading with no data, then the new data after its arguments change', () => {
        const harness = createHarness();
        const set = member(harness, 'setSubscriptionResult');
        const view = watch(harness, { id: 1 });
        act(() => set(QUERY, { id: 1 }, { loading: false, data: 'one' }));
        const before = view.seen.length;
        view.rerender({ query: QUERY, variables: { id: 2 } });
        expect(view.seen[before]).toEqual({ loading: false, data: 'one' });
        expect(view.result.current).toEqual({ loading: true });
        act(() => set(QUERY, { id: 2 }, { loading: false, data: 'two' }));
        expect(view.result.current).toEqual({ loading: false, data: 'two' });
      });

      testCase('goes straight to the new data when another hook already holds the new arguments', () => {
        const harness = createHarness();
        const set = member(harness, 'setSubscriptionResult');
        watch(harness, { id: 2 });
        act(() => set(QUERY, { id: 2 }, { loading: false, data: 'two' }));
        const view = watch(harness, { id: 1 });
        act(() => set(QUERY, { id: 1 }, { loading: false, data: 'one' }));
        const before = view.seen.length;
        view.rerender({ query: QUERY, variables: { id: 2 } });
        expect(view.seen.slice(before).some((result) => result.loading)).toBe(false);
        expect(view.result.current).toEqual({ loading: false, data: 'two' });
      });
    });

    group('custom mutation', () => {
      testCase('sets the trigger only once it can send the mutation', () => {
        const harness = createHarness();
        const setCanSend = member(harness, 'setCanSend');
        setCanSend(false);
        const { result } = renderHook(() => harness.host.useCustomMutation<{ value: string }>(MUTATION));
        expect(result.current[0]).toBeNull();
        act(() => setCanSend(true));
        expect(result.current[0]).not.toBeNull();
      });

      it('resolves when the mutation was sent', async () => {
        const harness = createHarness();
        const { result } = renderHook(() => harness.host.useCustomMutation<{ value: string }>(MUTATION));
        await waitFor(() => expect(result.current[0]).not.toBeNull());
        await act(async () => {
          await expect(triggerOf(result.current)({ variables: { value: 'a' } })).resolves.toBeUndefined();
        });
        expect(result.current[1].error).toBeUndefined();
      });

      it("shares the mutation state among a plugin's hooks with the same mutation", async () => {
        const harness = createHarness();
        const failure = new Error('refused');
        harness.failMutation(MUTATION, failure);
        const first = renderHook(() => harness.host.useCustomMutation<{ value: string }>(MUTATION));
        const second = renderHook(() => harness.host.useCustomMutation<{ value: string }>(MUTATION));
        const other = renderHook(() => harness.host.useCustomMutation<{ value: string }>(OTHER_MUTATION));
        await waitFor(() => expect(first.result.current[0]).not.toBeNull());
        let sent: Promise<void> = Promise.resolve();
        act(() => { sent = triggerOf(first.result.current)({ variables: { value: 'a' } }); });
        await waitFor(() => expect(second.result.current[1].loading).toBe(true));
        await act(async () => { await sent; });
        await waitFor(() => expect(second.result.current[1]).toEqual({ loading: false, error: failure }));
        expect(other.result.current[1]).toEqual({ loading: false });
      });

      it("resets the mutation state when the plugin's last hook with that mutation unmounts", async () => {
        const harness = createHarness();
        const failure = new Error('refused');
        harness.failMutation(MUTATION, failure);
        const first = renderHook(() => harness.host.useCustomMutation<{ value: string }>(MUTATION));
        const second = renderHook(() => harness.host.useCustomMutation<{ value: string }>(MUTATION));
        await waitFor(() => expect(first.result.current[0]).not.toBeNull());
        await act(async () => { await triggerOf(first.result.current)({ variables: { value: 'a' } }); });
        await waitFor(() => expect(second.result.current[1]).toEqual({ loading: false, error: failure }));

        first.unmount();
        const third = renderHook(() => harness.host.useCustomMutation<{ value: string }>(MUTATION));
        expect(third.result.current[1]).toEqual({ loading: false, error: failure });

        second.unmount();
        third.unmount();
        const remounted = renderHook(() => harness.host.useCustomMutation<{ value: string }>(MUTATION));
        expect(remounted.result.current[1]).toEqual({ loading: false });
      });

      it("drops a call through a kept trigger once the plugin's last hook with that mutation unmounted", async () => {
        const harness = createHarness();
        harness.failMutation(MUTATION, new Error('refused'));
        const first = renderHook(() => harness.host.useCustomMutation<{ value: string }>(MUTATION));
        await waitFor(() => expect(first.result.current[0]).not.toBeNull());
        const kept = triggerOf(first.result.current);
        first.unmount();
        const errorsBefore = harness.errorLogCount();
        await act(async () => { await kept({ variables: { value: 'a' } }); });

        const later = renderHook(() => harness.host.useCustomMutation<{ value: string }>(MUTATION));
        expect(later.result.current[1]).toEqual({ loading: false });
        await waitFor(() => expect(later.result.current[0]).not.toBeNull());
        harness.failMutation(MUTATION, undefined);
        await act(async () => { await triggerOf(later.result.current)({ variables: { value: 'b' } }); });
        await waitFor(() => expect(later.result.current[1]).toEqual({ loading: false }));
        // A sent call with an error set is logged by the time a later call ends.
        expect(harness.errorLogCount()).toBe(errorsBefore);
      });

      testCase("never shows another plugin's calls in a plugin's mutation state", async () => {
        const harness = createHarness();
        const other = member(harness, 'otherPluginHost')();
        harness.failMutation(MUTATION, new Error('refused'));
        const mine = renderHook(() => harness.host.useCustomMutation<{ value: string }>(MUTATION));
        const theirs = renderHook(() => other.useCustomMutation<{ value: string }>(MUTATION));
        await waitFor(() => expect(theirs.result.current[0]).not.toBeNull());
        await act(async () => { await triggerOf(theirs.result.current)({ variables: { value: 'a' } }); });
        await waitFor(() => expect(theirs.result.current[1].loading).toBe(false));
        expect(mine.result.current[1]).toEqual({ loading: false });
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

    group('data channel', () => {
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

    group('actions sheet', () => {
      it.todo('keeps the first item with an id, and logs and drops each later item with that id');
      it.todo('opens a selector even when the actions sheet is closed');
      it.todo('logs and ignores openSelector for an id with no selector item, or a pending one');
    });

    group('dialogs', () => {
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

    group('notices', () => {
      it.todo('shows a plugin notice after an app notice, never in its place');
    });

    group('logger', () => {
      it('accepts a record at every level', () => {
        const { host } = createHarness();
        (['debug', 'info', 'warn', 'error'] as const).forEach((level) => {
          expect(() => host.logger[level]({ logCode: 'conformance_log' }, 'message')).not.toThrow();
        });
      });
    });
  });
}

/**
 * What the loader cases need from a host that loads plugin definitions, as a meeting
 * starts. The mock host loads none: a plugin test passes its own definition to it.
 */
export interface LoaderHarness {
  /** Loads the plugins as a meeting starts, and returns the names of those loaded. */
  load(definitions: readonly MobilePluginDefinition[]): readonly string[];
  /** How many warn and error records the host has logged. */
  problemLogCount(): number;
}

// Ranges in npm's grammar that include the host version, whatever it is. For a release
// version they add x-ranges, which never include a pre-release.
const [MAJOR, MINOR] = HOST_API_VERSION.split('.');
const MATCHING_RANGES = [
  HOST_API_VERSION,
  `=${HOST_API_VERSION}`,
  `>=${HOST_API_VERSION}`,
  `${HOST_API_VERSION} - ${HOST_API_VERSION}`,
  `>=${HOST_API_VERSION} <99999.0.0`,
  `^${HOST_API_VERSION}`,
  `~${HOST_API_VERSION}`,
  `99999.0.0 || ${HOST_API_VERSION}`,
  ...(HOST_API_VERSION.includes('-') ? [] : [`${MAJOR}.${MINOR}.x`, `${MAJOR}.x`]),
];

const definitionNamed = (name: string, requiredHostApi = HOST_API_VERSION) => definePlugin({
  name,
  requiredHostApi,
  create: () => ({}),
});

/** The cases every host that loads plugin definitions must pass. */
export function describeLoaderConformance(name: string, createHarness: () => LoaderHarness): void {
  describe(`loader conformance: ${name}`, () => {
    describe('identity', () => {
      it("gives the plugin the definition's name as pluginName", () => {
        const names: string[] = [];
        const definition = definePlugin({
          name: 'ConformanceNamedPlugin',
          requiredHostApi: HOST_API_VERSION,
          create: (host: MobilePluginHost) => {
            names.push(host.pluginName);
            return {};
          },
        });
        createHarness().load([definition]);
        expect(names).toEqual(['ConformanceNamedPlugin']);
      });
    });

    describe('host API range', () => {
      it("loads a plugin whose range, in npm's full grammar, matches the host version", () => {
        const harness = createHarness();
        const definitions = MATCHING_RANGES.map((range, i) => definitionNamed(`Matching${i}`, range));
        expect(harness.load(definitions)).toEqual(definitions.map((d) => d.name));
        expect(harness.problemLogCount()).toBe(0);
      });

      it('skips and logs a plugin whose range does not match the host version', () => {
        const harness = createHarness();
        let created = 0;
        const tooNew = definePlugin({
          name: 'TooNew',
          requiredHostApi: '>=99999.0.0',
          create: () => { created += 1; return {}; },
        });
        expect(harness.load([tooNew])).toEqual([]);
        expect(created).toBe(0);
        expect(harness.problemLogCount()).toBeGreaterThan(0);
      });

      it.todo('lets a pre-release host version satisfy only a range naming a pre-release of the same major.minor.patch');
    });
  });
}
