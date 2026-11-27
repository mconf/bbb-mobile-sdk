import { useSyncExternalStore } from 'react';
import type { Capabilities } from '@mconf/bbb-mobile-plugin-api';

export interface CapabilityInputs {
  // The meeting's `audioBridge`; undefined until the meeting data arrives.
  audioBridge?: unknown;
  // `public.media.livekit.selectiveSubscription.enabled` from the client settings.
  selectiveSubscriptionEnabled?: unknown;
  // Whether the user has gone into a breakout room from this meeting.
  inBreakout?: unknown;
}

const NO_PLACEMENTS: Capabilities['placements'] = Object.freeze({});

// The same condition under which the LiveKit client subscribes to audio by
// media group (components/livekit), so a plugin is told what the app does.
const routesAudio = (inputs: CapabilityInputs): boolean => (
  inputs.audioBridge === 'livekit' && Boolean(inputs.selectiveSubscriptionEnabled ?? true)
);

// The app routes no cameras by media group and draws no placement yet.
export function capabilitiesFrom(inputs: CapabilityInputs): Capabilities {
  return Object.freeze({
    mediaGroupAudioRouting: routesAudio(inputs),
    mediaGroupCameraRouting: false,
    inBreakout: inputs.inBreakout === true,
    placements: NO_PLACEMENTS,
  });
}

export interface PluginCapabilitiesState {
  get(): Capabilities;
  subscribe(listener: () => void): () => void;
  set(inputs: CapabilityInputs): void;
  // What each plugin's host.useCapabilities() is.
  useCapabilities(): Capabilities;
}

// The capabilities of one App mount, set by the app as its state changes. All
// plugins read one object, which changes only when a capability does. A part
// that mounts late reads the current value on its first render.
export function createPluginCapabilitiesState(): PluginCapabilitiesState {
  let snapshot = capabilitiesFrom({});
  const listeners = new Set<() => void>();
  const get = () => snapshot;
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  };

  return {
    get,
    subscribe,
    set(inputs) {
      const next = capabilitiesFrom(inputs);
      if (next.mediaGroupAudioRouting === snapshot.mediaGroupAudioRouting
        && next.inBreakout === snapshot.inBreakout) return;
      snapshot = next;
      listeners.forEach((listener) => listener());
    },
    useCapabilities: () => useSyncExternalStore(subscribe, get),
  };
}
