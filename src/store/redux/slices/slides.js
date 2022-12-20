import { createSlice } from '@reduxjs/toolkit';

const slidesSlice = createSlice({
  name: 'slides',
  initialState: {
    slidesCollection: {},
    ready: false,
  },
  reducers: {
    addSlide: (state, action) => {
      const { slideObject } = action.payload;
      state.slidesCollection[slideObject.id] =
        action.payload.slideObject.fields;
    },
    removeSlide: (state, action) => {
      const { slideObject } = action.payload;
      delete state.slidesCollection[slideObject.id];
    },
    editSlide: (state, action) => {
      const { slideObject } = action.payload;
      state.slidesCollection[slideObject.id] = {
        ...state.slidesCollection[slideObject.id],
        ...action.payload.slideObject.fields,
      };
    },
    readyStateChanged: (state, action) => {
      state.ready = action.payload;
    },
  },
});

export const {
  addSlide,
  removeSlide,
  editSlide,
  readyStateChanged,
} = slidesSlice.actions;
export default slidesSlice.reducer;
