import { createSlice } from '@reduxjs/toolkit';

const slidesSlice = createSlice({
  name: 'slides',
  initialState: {
    slidesCollection: {},
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
  },
});
export const { addSlide, removeSlide, editSlide } = slidesSlice.actions;
export default slidesSlice.reducer;
