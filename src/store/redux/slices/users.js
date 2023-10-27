import { createSlice } from '@reduxjs/toolkit';

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    usersCollection: {},
    userIdMapCollectionId: {},
    ready: false,
  },
  reducers: {
    addUser: (state, action) => {
      const { userObject } = action.payload;
      state.usersCollection[userObject.id] = action.payload.userObject.fields;
      state.userIdMapCollectionId[action.payload.userObject.fields.userId] = userObject.id;
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

const selectUsersName = (state) => {
  const users = state.usersCollection.usersCollection;
  const outputObject = {};

  const result = Object.keys(users).map((key) => {
    return ({ [users[key].userId]: { name: users[key].name } });
  });

  result.forEach((item) => {
    const key = Object.keys(item)[0];
    const value = item[key];
    outputObject[key] = value;
  });

  return outputObject;
};

// exclude the users from breakouts
const selectMainUsers = (state) => {
  const allUsers = Object.values(state.usersCollection.usersCollection);
  return allUsers.filter((user) => user?.breakoutProps?.isBreakoutUser === false);
};

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
  selectMainUsers,
  selectUsersName,
};

export default usersSlice.reducer;
