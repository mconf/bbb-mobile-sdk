import { ConnectionState, Room, RoomEvent } from 'livekit-client';
import { EventEmitter2 } from 'eventemitter2';
import logger from '../logger';
import AudioManager from '../webrtc/audio-manager';
import VideoManager from '../webrtc/video-manager';
import ScreenshareManager from '../webrtc/screenshare-manager';
import { clearExpectedStreamStops, expectAllStreamStops } from './camera-state.ts';

// React Native has no DOM (window/CustomEvent), so cross-module LiveKit signals
// go through this emitter instead of window.dispatchEvent/addEventListener.
export const LK_FATAL_ERROR_EVENT = 'liveKitFatalError';
export const liveKitEvents = new EventEmitter2();

const DEFAULT_ROOM_OPTIONS = {
  adaptiveStream: true,
  dynacast: true,
  singlePeerConnection: false,
  stopLocalTrackOnUnpublish: false,
};

// Only the keys mobile honours are taken from the meeting settings: a server-authored
// roomOptions is shaped for the web client, and merging its nested blocks would drop
// the SDK's own defaults (echo cancellation, AGC) or replace a class instance.
// stopLocalTrackOnUnpublish stays off: the audio bridge keeps its mic capture
// across unpublishes.
const SUPPORTED_ROOM_OPTION_KEYS = [
  'adaptiveStream',
  'dynacast',
  'singlePeerConnection',
];

export const resolveRoomOptions = (configured) => {
  const picked = {};

  if (configured) {
    SUPPORTED_ROOM_OPTION_KEYS.forEach((key) => {
      if (configured[key] !== undefined) picked[key] = configured[key];
    });
  }

  return { ...DEFAULT_ROOM_OPTIONS, ...picked };
};

// Assigned in place: livekit-client hands the options object to LocalParticipant and
// RTCEngine by reference at construction, so it must never be swapped for a new one.
export const applyRoomOptions = (room, options) => {
  if (room && options) Object.assign(room.options, options);
};

export const liveKitRoom = new Room(resolveRoomOptions());

export const isReconnectingState = (state) => state === ConnectionState.Reconnecting
  || state === ConnectionState.SignalReconnecting;

// A room reports Disconnected before it has ever connected as well, and only a drop
// after a connect is an interruption. Reset on a final teardown because this Room is a
// module global reused across breakout entry, leave and SDK re-mounts.
let connectedOnce = false;

// Permanent rather than a per-teardown once(): this Room outlives every session, so
// those listeners would pile up.
liveKitRoom.on(RoomEvent.Connected, () => {
  connectedOnce = true;
  clearExpectedStreamStops();
});

export const hasConnectedOnce = () => connectedOnce;

const ROOM_CONNECTION_TIMEOUT = 15000;

// Both Connected and Reconnected have to be watched, or an operation fired during an
// SDK resume waits out the whole timeout. Disconnected ends the wait whatever its
// reason: the SDK only emits it once the room is torn down, so nothing can follow it.
export const waitForRoomConnection = (room, timeout = ROOM_CONNECTION_TIMEOUT) => {
  return new Promise((resolve, reject) => {
    if (!room) {
      reject(new Error('LiveKit room not available'));

      return;
    }

    if (room.state === ConnectionState.Connected) {
      resolve();

      return;
    }

    const cleanup = () => {
      clearTimeout(timer);
      room.off(RoomEvent.Connected, onConnected);
      room.off(RoomEvent.Reconnected, onConnected);
      room.off(RoomEvent.Disconnected, onDisconnected);
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('Room connection timeout'));
    }, timeout);
    const onConnected = () => {
      cleanup();
      resolve();
    };
    const onDisconnected = (reason) => {
      cleanup();
      reject(new Error(`Room disconnected while waiting for connection (reason=${reason})`));
    };

    room.once(RoomEvent.Connected, onConnected);
    room.once(RoomEvent.Reconnected, onConnected);
    room.once(RoomEvent.Disconnected, onDisconnected);
  });
};

export const disconnectLiveKitRoom = ({
  final = false,
}) => {
  if (final) {
    connectedOnce = false;
    // Every camera goes down with the session, which is not worth warning about.
    expectAllStreamStops();
  }

  liveKitRoom.disconnect()
    .then(() => {
      logger.debug({
        logCode: 'livekit_room_destroyed',
      }, 'LiveKit room destroyed');
    })
    .catch((error) => {
      logger.error({
        logCode: 'livekit_disconnect_error',
        extraInfo: {
          errorCode: error.code,
          errorMessage: error.message,
        },
      }, `LiveKit disconnect error: ${error.message}`);
    })
    .finally(() => {
      if (final) {
        AudioManager.destroy();
        VideoManager.destroy();
        ScreenshareManager.destroy();
      }
    });
};

export default {
  disconnectLiveKitRoom,
  liveKitRoom,
  liveKitEvents,
  LK_FATAL_ERROR_EVENT,
};
