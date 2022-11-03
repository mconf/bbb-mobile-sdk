import { createSlice } from '@reduxjs/toolkit';

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    usersCollection: {},
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
} = usersSlice.actions;

export {
  selectUsers,
  selectUserByIntId,
};

export default usersSlice.reducer;
