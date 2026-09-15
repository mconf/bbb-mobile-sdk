import type { Room } from 'livekit-client';
import type { EventEmitter2 } from 'eventemitter2';
import type { ReactiveVar } from '@apollo/client';
import type MeetingClientSettings from '../types/meetingClientSettings';
import type { CameraStopTracker } from '../services/livekit/camera-state';
import type { MuteIntent } from '../services/webrtc/mute-intent';

// One AppInstance exists per mounted root `App` (App.js). It owns everything
// that used to be a module-level singleton, so that a breakout room (a second
// `App` nested inside the main one) gets its own Redux store, LiveKit room,
// WebRTC managers and meeting settings without sharing anything with the main
// room. Non-React code receives it by constructor; React code reads it through
// `useAppInstance()` (src/app-instance/context.js).
export interface AppInstance {
  id: number;
  isBreakout: boolean;
  disposed: boolean;

  // Redux (src/store/redux/store.js createAppStore)
  store: any;

  // Meeting client settings (src/graphql/local-states/useMeetingSettings.ts)
  meetingSettingsVar: ReactiveVar<MeetingClientSettings>;
  getMeetingSettings: () => MeetingClientSettings;
  setMeetingSettings: (
    value: MeetingClientSettings | ((curr: MeetingClientSettings) => MeetingClientSettings)
  ) => void;

  // LiveKit (src/services/livekit)
  liveKitRoom: Room;
  liveKitEvents: EventEmitter2;
  disconnectLiveKit: (options?: { final?: boolean }) => Promise<void>;
  liveKitTracker: {
    hasConnectedOnce: () => boolean;
    resetConnectedOnce: () => void;
    restartCameraTrack: (track: any, options?: any) => Promise<void>;
    stopAbandonedCameraTracks: () => number;
  };
  // Camera stops this client asked for (src/services/livekit/camera-state.ts)
  cameraStops: CameraStopTracker;
  // Client-requested mute commands (src/services/webrtc/mute-intent.ts)
  muteIntent: MuteIntent;
  // LiveKit screen capture attempts (components/livekit/screenshare/controls)
  screenshareCapture: { stopRequested: boolean; staleCapturers: Set<any> };

  // WebRTC managers (src/services/webrtc)
  audioManager: any;
  videoManager: any;
  screenshareManager: any;
  iceServerCache: { fetch: (url: string) => Promise<any[]> };

  // Audio join dedupe guard (src/hooks/use-audio-join.js)
  audioJoinGuard: { inFlight: Promise<unknown> | null };
  invalidateInFlightAudioJoin: () => void;

  dispose: () => Promise<void>;
}
