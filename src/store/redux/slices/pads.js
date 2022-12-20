import { createSlice } from '@reduxjs/toolkit';

const padsSlice = createSlice({
  name: 'pads',
  initialState: {
    padsCollection: {},
    ready: false,
  },
  reducers: {
    addPad: (state, action) => {
      const { padObject } = action.payload;
      state.padsCollection[padObject.id] = action.payload.padObject.fields;
    },
    removePad: (state, action) => {
      const { padObject } = action.payload;
      delete state.padsCollection[padObject.id];
    },
    editPad: (state, action) => {
      const { padObject } = action.payload;
      state.padsCollection[padObject.id] = {
        ...state.padsCollection[padObject.id],
        ...action.payload.padObject.fields,
      };
    },
    readyStateChanged: (state, action) => {
      state.ready = action.payload;
    },
  },
});

export const {
  addPad,
  removePad,
  editPad,
  readyStateChanged,
} = padsSlice.actions;
export default padsSlice.reducer;
