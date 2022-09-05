import { createSlice } from '@reduxjs/toolkit';

const previousPollPublishedSlice = createSlice({
  name: 'previousPollPublished',
  initialState: {
    previousPollPublishedCollection: {},
  },
  reducers: {
    addPreviousPollPublished: (state, action) => {
      const { previousPollPublishedObject } = action.payload;
      state.previousPollPublishedCollection[previousPollPublishedObject.id] =
        action.payload.previousPollPublishedObject;
    },
    editPreviousPollPublished: (state, action) => {
      const { previousPollPublishedObject } = action.payload;
      state.previousPollPublishedCollection[previousPollPublishedObject.id] = {
        ...state.previousPollPublishedCollection[
          previousPollPublishedObject.id
        ],
        ...action.payload.previousPollPublishedObject,
      };
    },
  },
});
export const { addPreviousPollPublished, editPreviousPollPublished } =
  previousPollPublishedSlice.actions;
export default previousPollPublishedSlice.reducer;
