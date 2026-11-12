import { act, renderHook } from '@testing-library/react';
import {
  useCallback, useEffect, useRef, useSyncExternalStore,
} from 'react';
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';
import type { MobilePluginHost, MutationState, MutationTrigger } from '../src/index.js';
import { createMockHost } from '../src/testing/index.js';
import { describeHostConformance, type HostHarness } from './conformance/suite.js';
import { triggerOf } from './ready.js';

const NAME = 'host that reports a failure after the send';
const MUTATION = 'mutation Example($value: String!) { example(value: $value) }';
const IDLE: MutationState = { loading: false };
// Not 0: a zero-delay timer can fire before act returns, and a conformance case would then
// pass without waitFor.
const FAILURE_DELAY_MS = 20;

// A host that learns of a mutation failure only after the trigger resolved, as a host
// does when the transport or the server reports it. Its hooks with the same mutation share
// the state of the last call until the last of them unmounts, and a call made after that
// is dropped, as in the mock host. The rest is the mock host.
const createLateFailureHarness = (): HostHarness => {
  const { host, controller } = createMockHost();
  const failures = new Map<string, unknown>();
  const states = new Map<string, MutationState>();
  const lastCalls = new Map<string, number>();
  const hookCounts = new Map<string, number>();
  let callCount = 0;
  const listeners = new Set<() => void>();
  const subscribe = (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  };
  const setState = (mutation: string, state: MutationState): void => {
    states.set(mutation, state);
    listeners.forEach((listener) => listener());
  };
  const lateHost: MobilePluginHost = {
    ...host,
    useCustomMutation: <V>(mutation: string) => {
      const state = useSyncExternalStore(subscribe, () => states.get(mutation) ?? IDLE);
      const hasMounted = useRef(false);
      useEffect(() => {
        hasMounted.current = true;
        hookCounts.set(mutation, (hookCounts.get(mutation) ?? 0) + 1);
        return () => {
          const count = (hookCounts.get(mutation) ?? 1) - 1;
          if (count > 0) {
            hookCounts.set(mutation, count);
            return;
          }
          hookCounts.delete(mutation);
          states.delete(mutation);
          lastCalls.delete(mutation);
        };
      }, [mutation]);
      const trigger = useCallback<MutationTrigger<V>>(async () => {
        if (hasMounted.current && !hookCounts.has(mutation)) {
          host.logger.debug({ logCode: 'late_host_mutation_dropped' }, 'Mutation dropped');
          return;
        }
        callCount += 1;
        const call = callCount;
        lastCalls.set(mutation, call);
        setState(mutation, { loading: true });
        const error = failures.get(mutation);
        setTimeout(() => {
          if (lastCalls.get(mutation) === call) {
            setState(mutation, error === undefined ? IDLE : { loading: false, error });
          }
          if (error !== undefined) {
            host.logger.error({ logCode: 'late_host_mutation_failed' }, 'Mutation failed');
          }
        }, FAILURE_DELAY_MS);
      }, [mutation]);
      return [trigger, state];
    },
  };
  return {
    host: lateHost,
    setLocale: (locale) => controller.setLocale(locale),
    failMutation: (mutation, error) => {
      if (error === undefined) failures.delete(mutation);
      else failures.set(mutation, error);
    },
    errorLogCount: () => controller.logs.filter((entry) => entry.level === 'error').length,
    dialogIds: () => controller.dialogs.map((entry) => entry.dialog.id),
    pressDialogAction: (id, actionIndex) => controller.pressDialogAction(id, actionIndex),
  };
};

describeHostConformance(NAME, createLateFailureHarness);

// The mock host ends a call one microtask after it starts, too soon for a test to let time
// pass while the call is in flight. This host's delay lets a test do that.
describe(NAME, () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('shows the state of the last call when an earlier call fails while it is in flight', async () => {
    const harness = createLateFailureHarness();
    const { result } = renderHook(() => harness.host.useCustomMutation<{ value: string }>(MUTATION));
    harness.failMutation(MUTATION, new Error('refused'));
    await act(async () => { await triggerOf(result.current)({ variables: { value: 'a' } }); });
    act(() => { vi.advanceTimersByTime(FAILURE_DELAY_MS / 2); });
    harness.failMutation(MUTATION, undefined);
    await act(async () => { await triggerOf(result.current)({ variables: { value: 'b' } }); });

    act(() => { vi.advanceTimersByTime(FAILURE_DELAY_MS / 2); });
    expect(harness.errorLogCount()).toBe(1);
    expect(result.current[1]).toEqual({ loading: true });

    act(() => { vi.advanceTimersByTime(FAILURE_DELAY_MS / 2); });
    expect(result.current[1]).toEqual({ loading: false });
    expect(harness.errorLogCount()).toBe(1);
  });

  it("does not let a call that ends after its last hook unmounted set a later hook's state", async () => {
    const harness = createLateFailureHarness();
    harness.failMutation(MUTATION, new Error('refused'));
    const first = renderHook(() => harness.host.useCustomMutation<{ value: string }>(MUTATION));
    await act(async () => { await triggerOf(first.result.current)({ variables: { value: 'a' } }); });
    first.unmount();
    const { result } = renderHook(() => harness.host.useCustomMutation<{ value: string }>(MUTATION));
    expect(result.current[1]).toEqual({ loading: false });

    act(() => { vi.advanceTimersByTime(FAILURE_DELAY_MS); });
    expect(harness.errorLogCount()).toBe(1);
    expect(result.current[1]).toEqual({ loading: false });
  });
});
