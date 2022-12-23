import { createSlice } from '@reduxjs/toolkit';

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    usersCollection: {},
    ready: false,
  },
  reducers: {
    addUser: (state, action) => {
      const { userObject } = action.payload;
      state.usersCollection[userObject.id] = action.payload.userObject.fields;
    },
    removeUser: (state, action) => {
      const { userObject } = action.payload;
      delete state.usersCollection[userObject.id];
    },
    editUser: (state, action) => {
      const { userObject } = action.payload;
      state.usersCollection[userObject.id] = {
        ...state.usersCollection[userObject.id],
        ...action.payload.userObject.fields,
      };
    },
    readyStateChanged: (state, action) => {
      state.ready = action.payload;
    },
    cleanupStaleData: (state, action) => {
      const currentSubscriptionId = action.payload;
      if (state?.usersCollection) {
        Object.entries(state?.usersCollection)
          .forEach(([id, document]) => {
            const { subscriptionId } = document;

            if (typeof subscriptionId !== 'string') return;

            if (subscriptionId !== currentSubscriptionId) {
              delete state.usersCollection[id];
            }
          });
      }
    },
  },
});

// Selectors
const selectUsers = (state) => Object.values(
  state.usersCollection.usersCollection
);

const selectUserByIntId = (state, userId) => selectUsers(state)
  .find((user) => user.intId === userId);

export const {
  addUser,
  removeUser,
  editUser,
  readyStateChanged,
  cleanupStaleData,
} = usersSlice.actions;

export {
  selectUsers,
  selectUserByIntId,
};

export default usersSlice.reducer;
