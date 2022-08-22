import { createSlice } from '@reduxjs/toolkit';

const currentUserSlice = createSlice({
  name: 'current-user',
  initialState: {
    currentUserCollection: {},
  },
  reducers: {
    addCurrentUser: (state, action) => {
      const { currentUserObject } = action.payload;
      state.currentUserCollection[currentUserObject.id] =
        action.payload.currentUserObject.fields;
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
export const { addCurrentUser, removeCurrentUser, editCurrentUser } =
  currentUserSlice.actions;
export default currentUserSlice.reducer;
