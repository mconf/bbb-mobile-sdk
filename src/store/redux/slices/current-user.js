import { createSlice, createSelector } from '@reduxjs/toolkit';
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

const isLocked = createSelector(
  [selectCurrentUser],
  (currentUser) => currentUser?.role !== 'MODERATOR' && currentUser?.locked === true
);

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
  const currentState = listenerApi.getState();
  const { ended } = currentState.client.sessionState;
  let { endReason } = currentState.client.sessionState;

  if (!ended) {
    if (editCurrentUser.match(action) || addCurrentUser.match(action)) {
      const { currentUserObject } = action.payload;
      if (currentUserObject?.fields?.ejected) {
        endReason = currentUserObject?.fields?.ejectedReason || 403;
      } else if (currentUserObject?.fields?.loggedOut) {
        endReason = 'logged_out';
      }
    }

    if (addMeeting.match(action) || editMeeting.match(action)) {
      endReason = 'meeting_ended';
    }

    listenerApi.dispatch(sessionStateChanged({
      ended: true,
      endReason,
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
  isLocked,
  logoutOrEjectionPredicate,
  logoutOrEjectionListener,
};

export default currentUserSlice.reducer;
