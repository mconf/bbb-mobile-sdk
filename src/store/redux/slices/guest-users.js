import { createSlice, createSelector } from '@reduxjs/toolkit';

const guestUsersSlice = createSlice({
  name: 'guestUsers',
  initialState: {
    guestUsersCollection: {},
    ready: false,
  },
  reducers: {
    addGuestUser: (state, action) => {
      const { userObject } = action.payload;
      state.guestUsersCollection[userObject.id] = userObject.fields;
    },
    removeGuestUser: (state, action) => {
      const { userObject } = action.payload;
      delete state.guestUsersCollection[userObject.id];
    },
    editGuestUser: (state, action) => {
      const { userObject } = action.payload;
      state.guestUsersCollection[userObject.id] = {
        ...state.guestUsersCollection[userObject.id],
        ...userObject.fields,
      };
    },
    readyStateChanged: (state, action) => {
      state.ready = action.payload;
    },
    cleanupStaleData: (state, action) => {
      const currentSubscriptionId = action.payload;
      if (state?.guestUsersCollection) {
        Object.entries(state?.guestUsersCollection)
          .forEach(([id, document]) => {
            const { subscriptionId } = document;

            if (typeof subscriptionId !== 'string') return;

            if (subscriptionId !== currentSubscriptionId) {
              delete state.guestUsersCollection[id];
            }
          });
      }
    },
  },
});

// Selectors
const selectGuestUserByDocumentId = (state, documentId) => {
  return state.guestUsersCollection[documentId];
};

const selectWaitingUsers = createSelector(
  (state) => state.guestUsersCollection.guestUsersCollection,
  (guestUsersCollection) => {
    return Object.values(guestUsersCollection).filter((guest) => !guest.approved && !guest.denied);
  }
);

export const {
  addGuestUser,
  removeGuestUser,
  editGuestUser,
  readyStateChanged,
  cleanupStaleData,
} = guestUsersSlice.actions;

export {
  selectGuestUserByDocumentId,
  selectWaitingUsers,
};

export default guestUsersSlice.reducer;
