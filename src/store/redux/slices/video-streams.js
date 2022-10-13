import {
  createSlice,
  createSelector,
  createListenerMiddleware,
} from '@reduxjs/toolkit';
import { selectUsers } from './users';
import { selectCurrentUser } from './current-user';
import { sortVideoStreams } from '../../../services/sorts/video';
import VideoManager from '../../../services/webrtc/video-manager';

// Slice
const videoStreamsSlice = createSlice({
  name: 'video-streams',
  initialState: {
    videoStreamsCollection: {},
  },
  reducers: {
    addVideoStream: (state, action) => {
      const { videoStreamObject } = action.payload;
      state.videoStreamsCollection[videoStreamObject.id] = action.payload.videoStreamObject.fields;
    },
    removeVideoStream: (state, action) => {
      const { videoStreamObject } = action.payload;
      delete state.videoStreamsCollection[videoStreamObject.id];
    },
    editVideoStream: (state, action) => {
      const { videoStreamObject } = action.payload;
      state.videoStreamsCollection[videoStreamObject.id] = {
        ...state.videoStreamsCollection[videoStreamObject.id],
        ...action.payload.videoStreamObject.fields,
      };
    },
  },
});

// Selectors
const selectVideoStreams = (state) => Object.values(
  state.videoStreamsCollection.videoStreamsCollection
);

const selectSortedVideoStreams = createSelector(
  [selectVideoStreams, selectUsers, selectCurrentUser],
  (videoStreams, users, currentUser) => {
    return sortVideoStreams(users.map((user) => {
      const {
        stream: cameraId,
        floor,
        lastFloorTime,
        pin,
      } = videoStreams.find((stream) => stream.userId === user.intId) || {};

      return {
        name: user.name,
        cameraId,
        userId: user.intId,
        floor,
        lastFloorTime,
        pin,
        userAvatar: user.avatar,
        userColor: user.color,
        local: user.intId === currentUser?.userId
      };
    }));
  }
);

const selectVideoStreamByDocumentId = (state, documentId) => {
  return state.videoStreamsCollection.videoStreamsCollection[documentId];
};

// Middlewares
const videoStreamCleanupMW = createListenerMiddleware();
videoStreamCleanupMW.startListening({
  actionCreator: videoStreamsSlice.actions.removeVideoStream,
  effect: async (action, listenerApi) => {
    const { videoStreamObject } = action.payload;
    const previousState = listenerApi.getOriginalState();
    const removedVideoStream = selectVideoStreamByDocumentId(
      previousState,
      videoStreamObject.id
    );
    listenerApi.cancelActiveListeners();
    // Stop video manager units (if they exist)
    if (removedVideoStream?.stream) VideoManager.stopVideo(removedVideoStream.stream);
  },
});

export const {
  addVideoStream,
  removeVideoStream,
  editVideoStream
} = videoStreamsSlice.actions;

export {
  selectSortedVideoStreams,
  selectVideoStreamByDocumentId,
  videoStreamCleanupMW,
};

export default videoStreamsSlice.reducer;
