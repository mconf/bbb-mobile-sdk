import { createSlice } from '@reduxjs/toolkit';
import { addMeeting, editMeeting } from './meeting';
import { sessionStateChanged } from './wide-app/client';

// Slice
const currentUserSlice = createSlice({
  name: 'current-user',
  initialState: {
    currentUserCollection: {},
  },
  reducers: {
    addCurrentUser: (state, action) => {
      const { currentUserObject } = action.payload;
      state.currentUserCollection[currentUserObject.id] = action.payload.currentUserObject.fields;
    },
    removeCurrentUser: (state, action) => {
      const { currentUserObject } = action.payload;
      delete state.currentUserCollection[currentUserObject.id];
    },
    editCurrentUser: (state, action) => {
      const { currentUserObject } = action.payload;
      state.currentUserCollection[currentUserObject.id] = {
        ...state.currentUserCollection[currentUserObject.id],
        ...action.payload.currentUserObject.fields,
      };
    },
  },
});

// Selectors
const selectCurrentUser = (state) => Object.values(
  state.currentUserCollection?.currentUserCollection
)[0];

// Middleware effects and listeners
const logoutOrEjectionPredicate = (action, currentState) => {
  if (currentState.client.sessionState.ended) return false;

  if (editCurrentUser.match(action) || addCurrentUser.match(action)) {
    const { currentUserObject } = action.payload;
    return currentUserObject?.fields?.loggedOut || currentUserObject?.fields?.ejected;
  }

  if (addMeeting.match(action) || editMeeting.match(action)) {
    const { meetingObject } = action.payload;
    return meetingObject?.fields?.meetingEnded;
  }

  return false;
};

const logoutOrEjectionListener = (action, listenerApi) => {
  if (editCurrentUser.match(action) || addCurrentUser.match(action)) {
    const { currentUserObject } = action.payload;
    listenerApi.dispatch(sessionStateChanged({
      ended: true,
      endReason: currentUserObject?.fields?.ejectedReason,
    }));
  }

  if (addMeeting.match(action) || editMeeting.match(action)) {
    listenerApi.dispatch(sessionStateChanged({
      ended: true,
      endReason: 'meeting_ended'
    }));
  }
};

export const {
  addCurrentUser,
  removeCurrentUser,
  editCurrentUser
} = currentUserSlice.actions;

export {
  selectCurrentUser,
  logoutOrEjectionPredicate,
  logoutOrEjectionListener,
};

export default currentUserSlice.reducer;
