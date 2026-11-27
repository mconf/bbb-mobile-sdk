import { createAppStore } from '../store/redux/store';
import { createMeetingSettingsState } from '../graphql/local-states/useMeetingSettings';
import {
  createLiveKitRoom,
  createLiveKitEvents,
  createLiveKitRoomTracker,
  disconnectLiveKitRoom,
} from '../services/livekit';
import { createCameraStopTracker } from '../services/livekit/camera-state.ts';
import { createMuteIntent } from '../services/webrtc/mute-intent.ts';
import AudioManager from '../services/webrtc/audio-manager';
import VideoManager from '../services/webrtc/video-manager';
import ScreenshareManager from '../services/webrtc/screenshare-manager';
import { createIceServerCache } from '../services/webrtc/fetch-ice-servers';
import { createPluginRegistry } from '../plugins/registry';
import { createPluginHostLog } from '../plugins/app-log';
import { createPluginActivationState } from '../plugins/activation-state';
import { createPluginCapabilitiesState } from '../plugins/capabilities';
import { createCustomSubscriptions } from '../plugins/custom-subscriptions';
import { createPluginGraphqlState } from '../plugins/graphql-state';

let instanceCounter = 0;

// Builds the per-App instance object (see ./types.ts). Build order matters
// only in that the managers are constructed before the store: the store's
// listener middlewares receive the instance as `extra` and reach the managers
// through it, while the managers only touch `instance.store` lazily (inside
// methods), never in their constructors.
export const createAppInstance = ({ isBreakout = false, plugins = undefined } = {}) => {
  instanceCounter += 1;

  /** @type {import('./types').AppInstance} */
  const instance = {
    id: instanceCounter,
    isBreakout,
    disposed: false,
  };

  Object.assign(instance, createMeetingSettingsState());

  instance.liveKitRoom = createLiveKitRoom();
  instance.liveKitEvents = createLiveKitEvents();
  instance.cameraStops = createCameraStopTracker();
  instance.liveKitTracker = createLiveKitRoomTracker(instance.liveKitRoom, {
    onConnected: instance.cameraStops.clearExpectedStreamStops,
  });
  instance.muteIntent = createMuteIntent();
  // LiveKit screen capture attempts (components/livekit/screenshare/controls)
  instance.screenshareCapture = { stopRequested: false, staleCapturers: new Set() };
  instance.iceServerCache = createIceServerCache();

  instance.audioManager = new AudioManager(instance);
  instance.videoManager = new VideoManager(instance);
  instance.screenshareManager = new ScreenshareManager(instance);

  instance.store = createAppStore(instance);

  instance.pluginHostLog = createPluginHostLog(instance.store);
  instance.pluginCapabilities = createPluginCapabilitiesState();
  instance.pluginGraphql = createPluginGraphqlState();
  const log = instance.pluginHostLog.write;
  instance.plugins = createPluginRegistry(plugins, {
    isBreakout,
    log,
    useCapabilities: instance.pluginCapabilities.useCapabilities,
    graphql: {
      state: instance.pluginGraphql,
      subscriptions: createCustomSubscriptions(instance.pluginGraphql, log),
    },
  });
  instance.pluginActivation = createPluginActivationState();

  instance.audioJoinGuard = { inFlight: null };
  instance.invalidateInFlightAudioJoin = () => {
    instance.audioJoinGuard.inFlight = null;
  };

  instance.disconnectLiveKit = ({ final = false } = {}) => (
    disconnectLiveKitRoom(instance, { final })
  );

  instance.dispose = () => {
    if (instance.disposed) return Promise.resolve();

    instance.disposed = true;
    instance.pluginHostLog.dispose();

    return instance.disconnectLiveKit({ final: true });
  };

  return instance;
};

export default createAppInstance;
