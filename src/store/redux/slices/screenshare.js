import { createSlice } from '@reduxjs/toolkit';

const screenshareSlice = createSlice({
  name: 'screenshare',
  initialState: {
    screenshareCollection: {},
  },
  reducers: {
    addScreenshare: (state, action) => {
      const { screenshareObject } = action.payload;
      state.screenshareCollection[screenshareObject.id] =
        action.payload.screenshareObject.fields;
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

export const { addScreenshare } = screenshareSlice.actions;
export const { removeScreenshare } = screenshareSlice.actions;
export const { editScreenshare } = screenshareSlice.actions;
export default screenshareSlice.reducer;
