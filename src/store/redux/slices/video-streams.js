import { createSlice, createSelector } from '@reduxjs/toolkit';
import { selectMainUsers } from './users';
import { sortVideoUsers } from '../../../services/sorts/video';
import { selectLocalCameraId } from './wide-app/video';
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

const selectCurrentUserId = (state) => state.client.meetingData?.internalUserID;

const selectSortedVideoUsers = createSelector(
  [selectVideoStreams, selectMainUsers, selectLocalCameraId, selectCurrentUserId],
  (videoStreams, users, localCameraId, currentUserId) => {
    return sortVideoUsers(users.map((user) => {
      const {
        stream: cameraId,
        floor,
        lastFloorTime,
        pin,
      } = videoStreams.find((stream) => stream.userId === user.intId) || {};
      const local = (typeof cameraId === 'string' && localCameraId === cameraId)
        || (currentUserId != null && user.intId === currentUserId);

      return {
        name: user.name,
        cameraId,
        userId: user.intId,
        floor,
        lastFloorTime,
        pin,
        userRole: user.role,
        userAvatar: user.avatar,
        userColor: user.color,
        userEmoji: user.emoji,
        local,
      };
    }), Settings.media.videoPageSize);
  }
);

const selectVideoStreamByDocumentId = (state, documentId) => {
  return state.videoStreamsCollection.videoStreamsCollection[documentId];
};

const selectLocalVideoStreams = createSelector(
  [selectVideoStreams, selectCurrentUserId],
  (videoStreams, currentUserId) => {
    if (!currentUserId) {
      return [];
    }

    return videoStreams.filter(({ userId }) => userId === currentUserId);
  }
);

// Middleware effects and listeners
const videoStreamCleanupListener = (action, listenerApi) => {
  const { videoStreamObject } = action.payload;
  const previousState = listenerApi.getOriginalState();
  const removedVideoStream = selectVideoStreamByDocumentId(
    previousState,
    videoStreamObject.id
  );
  listenerApi.cancelActiveListeners();
  // Stop video manager units (if they exist) - the manager of the App this
  // store belongs to, via listenerApi.extra (the AppInstance).
  const { videoManager } = listenerApi.extra;
  if (removedVideoStream?.stream) videoManager.stopVideo(removedVideoStream.stream);
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
  selectLocalVideoStreams,
  videoStreamCleanupListener,
};

export default videoStreamsSlice.reducer;
