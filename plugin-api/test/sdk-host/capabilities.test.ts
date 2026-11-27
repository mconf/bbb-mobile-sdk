import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  HOST_API_VERSION,
  type Capabilities,
  type MobilePluginDefinition,
  type MobilePluginHost,
} from '@mconf/bbb-mobile-plugin-api';
import { capabilitiesFrom, createPluginCapabilitiesState } from '../../../src/plugins/capabilities';
import { createPluginRegistry } from '../../../src/plugins/registry';

describe('plugin host: capabilities', () => {
  it('routes audio per listener when LiveKit carries audio and selective subscription is on', () => {
    expect(capabilitiesFrom({ audioBridge: 'livekit', selectiveSubscriptionEnabled: true, inBreakout: false }))
      .toEqual({
        mediaGroupAudioRouting: true,
        mediaGroupCameraRouting: false,
        inBreakout: false,
        placements: {},
      });
  });

  it('treats a missing selective subscription setting as on, as the LiveKit client does', () => {
    [undefined, null].forEach((selectiveSubscriptionEnabled) => {
      expect(capabilitiesFrom({ audioBridge: 'livekit', selectiveSubscriptionEnabled })
        .mediaGroupAudioRouting, String(selectiveSubscriptionEnabled)).toBe(true);
    });
  });

  it('reads the selective subscription setting as the LiveKit client does: falsy is off', () => {
    [false, 0, ''].forEach((selectiveSubscriptionEnabled) => {
      expect(capabilitiesFrom({ audioBridge: 'livekit', selectiveSubscriptionEnabled })
        .mediaGroupAudioRouting, String(selectiveSubscriptionEnabled)).toBe(false);
    });
    expect(capabilitiesFrom({ audioBridge: 'livekit', selectiveSubscriptionEnabled: 'yes' })
      .mediaGroupAudioRouting).toBe(true);
  });

  it('does not route audio when another bridge carries it, or before the meeting is known', () => {
    ['bbb-webrtc-sfu', 'freeswitch', undefined, null, 'LiveKit'].forEach((audioBridge) => {
      expect(capabilitiesFrom({ audioBridge, selectiveSubscriptionEnabled: true }).mediaGroupAudioRouting, String(audioBridge))
        .toBe(false);
    });
  });

  it('reports a breakout only for the boolean true, and keeps audio routing as it is', () => {
    const inside = capabilitiesFrom({ audioBridge: 'livekit', selectiveSubscriptionEnabled: true, inBreakout: true });
    expect(inside.inBreakout).toBe(true);
    expect(inside.mediaGroupAudioRouting).toBe(true);
    [false, undefined, 'true', 1].forEach((inBreakout) => {
      expect(capabilitiesFrom({ audioBridge: 'livekit', inBreakout }).inBreakout, String(inBreakout)).toBe(false);
    });
  });

  it('never routes cameras and draws no placement', () => {
    const capabilities = capabilitiesFrom({ audioBridge: 'livekit', selectiveSubscriptionEnabled: true, inBreakout: true });
    expect(capabilities.mediaGroupCameraRouting).toBe(false);
    expect(capabilities.placements).toEqual({});
  });

  it('returns frozen objects', () => {
    const capabilities = capabilitiesFrom({ audioBridge: 'livekit' });
    expect(Object.isFrozen(capabilities)).toBe(true);
    expect(Object.isFrozen(capabilities.placements)).toBe(true);
  });
});

describe('plugin host: capabilities state', () => {
  it('starts with every capability off', () => {
    expect(createPluginCapabilitiesState().get()).toEqual(capabilitiesFrom({}));
  });

  it('keeps the same object, and notifies no one, while the capabilities stay the same', () => {
    const state = createPluginCapabilitiesState();
    const listener = vi.fn();
    state.subscribe(listener);
    state.set({ audioBridge: 'livekit', selectiveSubscriptionEnabled: true });
    const first = state.get();
    expect(listener).toHaveBeenCalledTimes(1);

    state.set({ audioBridge: 'livekit', selectiveSubscriptionEnabled: true });
    state.set({ audioBridge: 'livekit', selectiveSubscriptionEnabled: undefined });
    expect(state.get()).toBe(first);
    expect(listener).toHaveBeenCalledTimes(1);

    state.set({ audioBridge: 'livekit', selectiveSubscriptionEnabled: true, inBreakout: true });
    expect(state.get()).not.toBe(first);
    expect(state.get().inBreakout).toBe(true);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('stops notifying a listener once it unsubscribes', () => {
    const state = createPluginCapabilitiesState();
    const listener = vi.fn();
    const unsubscribe = state.subscribe(listener);
    unsubscribe();
    state.set({ audioBridge: 'livekit' });
    expect(listener).not.toHaveBeenCalled();
  });

  it('gives a reader that mounts later the current capabilities on its first render', () => {
    const state = createPluginCapabilitiesState();
    state.set({ audioBridge: 'livekit', selectiveSubscriptionEnabled: true });
    const seen: Capabilities[] = [];
    renderHook(() => { const capabilities = state.useCapabilities(); seen.push(capabilities); });
    expect(seen[0].mediaGroupAudioRouting).toBe(true);
  });

  it('re-renders a mounted reader when a capability changes', () => {
    const state = createPluginCapabilitiesState();
    const { result } = renderHook(() => state.useCapabilities());
    expect(result.current.mediaGroupAudioRouting).toBe(false);
    act(() => state.set({ audioBridge: 'livekit' }));
    expect(result.current.mediaGroupAudioRouting).toBe(true);
  });
});

describe('plugin host: useCapabilities', () => {
  const hostOf = (useCapabilities?: () => Capabilities) => {
    let host: MobilePluginHost | undefined;
    const definition: MobilePluginDefinition = {
      name: 'PluginA',
      requiredHostApi: HOST_API_VERSION,
      create: (given) => { host = given; return {}; },
    };
    createPluginRegistry([definition], { isBreakout: false, log: () => {}, useCapabilities });
    if (!host) throw new Error('the plugin was not created');
    return host;
  };

  it("reads the app's capabilities state", () => {
    const state = createPluginCapabilitiesState();
    const host = hostOf(state.useCapabilities);
    const { result } = renderHook(() => host.useCapabilities());
    expect(result.current).toBe(state.get());
    act(() => state.set({ audioBridge: 'livekit', inBreakout: true }));
    expect(result.current).toBe(state.get());
    expect(result.current.inBreakout).toBe(true);
  });

  it('throws when the app gave the host no capabilities hook', () => {
    const host = hostOf();
    expect(() => host.useCapabilities()).toThrow('useCapabilities is not available in this host version');
  });
});
