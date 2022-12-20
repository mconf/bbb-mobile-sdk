import { createSlice } from '@reduxjs/toolkit';

const presentationsSlice = createSlice({
  name: 'presentations',
  initialState: {
    presentationsCollection: {},
    ready: false,
  },
  reducers: {
    addPresentation: (state, action) => {
      const { presentationObject } = action.payload;
      state.presentationsCollection[presentationObject.id] =
        action.payload.presentationObject.fields;
    },
    removePresentation: (state, action) => {
      const { presentationObject } = action.payload;
      delete state.presentationsCollection[presentationObject.id];
    },
    editPresentation: (state, action) => {
      const { presentationObject } = action.payload;
      state.presentationsCollection[presentationObject.id] = {
        ...state.presentationsCollection[presentationObject.id],
        ...action.payload.presentationObject.fields,
      };
    },
    readyStateChanged: (state, action) => {
      state.ready = action.payload;
    },
  },
});

export const {
  addPresentation,
  removePresentation,
  editPresentation,
  readyStateChanged,
} = presentationsSlice.actions;
export default presentationsSlice.reducer;
