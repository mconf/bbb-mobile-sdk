import { createSlice } from '@reduxjs/toolkit';

const presentationsSlice = createSlice({
  name: 'presentations',
  initialState: {
    presentationsCollection: {},
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
  },
});
export const { addPresentation, removePresentation, editPresentation } =
  presentationsSlice.actions;
export default presentationsSlice.reducer;
