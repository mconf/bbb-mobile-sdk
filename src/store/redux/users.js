import { createSlice } from '@reduxjs/toolkit';

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    usersCollection: {},
  },
  reducers: {
    addUser: (state, action) => {
      const { userObject } = action.payload;
      state.usersCollection[userObject.id] = action.payload.userObject;
    },
    removeUser: (state, action) => {
      const { userObject } = action.payload;
      delete state.usersCollection[userObject.id];
    },
  },
});
export const { addUser } = usersSlice.actions;
export const { removeUser } = usersSlice.actions;
export default usersSlice.reducer;
