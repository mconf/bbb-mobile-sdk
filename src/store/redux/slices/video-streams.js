import { createSlice, createSelector } from '@reduxjs/toolkit';
import { selectUsers } from './users';
import { sortVideoUsers } from '../../../services/sorts/video';
import { selectLocalCameraId } from './wide-app/video';
import VideoManager from '../../../services/webrtc/video-manager';
import Settings from '../../../../settings.json';

// Slice
const videoStreamsSlice = createSlice({
  name: 'video-streams',
  initialState: {
    videoStreamsCollection: {},
    ready: false,
  },
  reducers: {
    addVideoStream: (state, action) => {
      const { videoStreamObject } = action.payload;
      state.videoStreamsCollection[videoStreamObject.id] = videoStreamObject.fields;
    },
    removeVideoStream: (state, action) => {
      const { videoStreamObject } = action.payload;
      delete state.videoStreamsCollection[videoStreamObject.id];
    },
    editVideoStream: (state, action) => {
      const { videoStreamObject } = action.payload;
      state.videoStreamsCollection[videoStreamObject.id] = {
        ...state.videoStreamsCollection[videoStreamObject.id],
        ...videoStreamObject.fields,
      };
    },
    readyStateChanged: (state, action) => {
      state.ready = action.payload;
    },
    cleanupStaleData: (state, action) => {
      const currentSubscriptionId = action.payload;
      if (state?.videoStreamsCollection) {
        Object.entries(state?.videoStreamsCollection)
          .forEach(([id, document]) => {
            const { subscriptionId } = document;

            if (typeof subscriptionId !== 'string') return;

            if (subscriptionId !== currentSubscriptionId) {
              delete state.videoStreamsCollection[id];
            }
          });
      }
    },
  },
});

// Selectors
const selectVideoStreams = (state) => Object.values(
  state.videoStreamsCollection.videoStreamsCollection
);

const selectSortedVideoUsers = createSelector(
  [selectVideoStreams, selectUsers, selectLocalCameraId],
  (videoStreams, users, localCameraId) => {
    return sortVideoUsers(users.map((user) => {
      const {
        stream: cameraId,
        floor,
        lastFloorTime,
        pin,
      } = videoStreams.find((stream) => stream.userId === user.intId) || {};
      const local = (typeof cameraId === 'string' && localCameraId === cameraId)
        || user.intId === VideoManager.userId;

      return {
        name: user.name,
        cameraId,
        userId: user.intId,
        floor,
        lastFloorTime,
        pin,
        userAvatar: user.avatar,
        userColor: user.color,
        local,
      };
    }), Settings.media.videoPageSize);
  }
);

const selectVideoStreamByDocumentId = (state, documentId) => {
  return state.videoStreamsCollection.videoStreamsCollection[documentId];
};

// Middleware effects and listeners
const videoStreamCleanupListener = (action, listenerApi) => {
  const { videoStreamObject } = action.payload;
  const previousState = listenerApi.getOriginalState();
  const removedVideoStream = selectVideoStreamByDocumentId(
    previousState,
    videoStreamObject.id
  );
  listenerApi.cancelActiveListeners();
  // Stop video manager units (if they exist)
  if (removedVideoStream?.stream) VideoManager.stopVideo(removedVideoStream.stream);
};

export const {
  addVideoStream,
  removeVideoStream,
  editVideoStream,
  readyStateChanged,
  cleanupStaleData,
} = videoStreamsSlice.actions;

export {
  selectSortedVideoUsers,
  selectVideoStreamByDocumentId,
  videoStreamCleanupListener,
};

export default videoStreamsSlice.reducer;
