import { createSlice, createListenerMiddleware } from '@reduxjs/toolkit';
import ScreenshareManager from '../../../services/webrtc/screenshare-manager';

// Slice
const screenshareSlice = createSlice({
  name: 'screenshare',
  initialState: {
    screenshareCollection: {},
  },
  reducers: {
    addScreenshare: (state, action) => {
      const { screenshareObject } = action.payload;
      state.screenshareCollection[screenshareObject.id] = action.payload.screenshareObject.fields;
    },
    removeScreenshare: (state, action) => {
      const { screenshareObject } = action.payload;
      delete state.screenshareCollection[screenshareObject.id];
    },
    editScreenshare: (state, action) => {
      const { screenshareObject } = action.payload;
      state.screenshareCollection[screenshareObject.id] = {
        ...state.screenshareCollection[screenshareObject.id],
        ...action.payload.screenshareObject.fields,
      };
    },
  },
});

// Selectors
const selectScreenshareByDocumentId = (state, documentId) => {
  return state.screenshareCollection.screenshareCollection[documentId];
};

const selectScreenshare = (state) => Object.values(
  state.screenshareCollection.screenshareCollection
)[0];

// Middlewares
const screenshareCleanupMW = createListenerMiddleware();
screenshareCleanupMW.startListening({
  actionCreator: screenshareSlice.actions.removeScreenshare,
  effect: (action, listenerApi) => {
    const { screenshareObject } = action.payload;
    const previousState = listenerApi.getOriginalState();
    const removedScreenshareStream = selectScreenshareByDocumentId(
      previousState,
      screenshareObject.id
    );
    listenerApi.cancelActiveListeners();
    // Stop screenshare manager units (if they exist)
    if (removedScreenshareStream) ScreenshareManager.unsubscribe();
  },
});

export const {
  addScreenshare,
  removeScreenshare,
  editScreenshare,
} = screenshareSlice.actions;

export {
  selectScreenshare,
  selectScreenshareByDocumentId,
  screenshareCleanupMW,
};

export default screenshareSlice.reducer;
