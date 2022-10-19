import { createSlice } from '@reduxjs/toolkit';

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

export const {
  addCurrentUser,
  removeCurrentUser,
  editCurrentUser
} = currentUserSlice.actions;

export {
  selectCurrentUser,
};

export default currentUserSlice.reducer;
