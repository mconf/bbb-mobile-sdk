import { ConnectionState, Room, RoomEvent } from 'livekit-client';
import { EventEmitter2 } from 'eventemitter2';
import logger from '../logger';
import AudioManager from '../webrtc/audio-manager';
import VideoManager from '../webrtc/video-manager';
import ScreenshareManager from '../webrtc/screenshare-manager';

// React Native has no DOM (window/CustomEvent), so cross-module LiveKit signals
// go through this emitter instead of window.dispatchEvent/addEventListener.
export const LK_FATAL_ERROR_EVENT = 'liveKitFatalError';
export const liveKitEvents = new EventEmitter2();

export const liveKitRoom = new Room({
  adaptiveStream: true,
  dynacast: true,
  stopLocalTrackOnUnpublish: false,
  disconnectOnPageLeave: true,
});

export const ROOM_CONNECTION_TIMEOUT = 15000;

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
