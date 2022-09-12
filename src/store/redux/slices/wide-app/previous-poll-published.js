import { createSlice } from '@reduxjs/toolkit';

const previousPollPublishedSlice = createSlice({
  name: 'previousPollPublished',
  initialState: {
    previousPollPublishedCollection: {},
  },
  reducers: {
    addPreviousPollPublished: (state, action) => {
      const { previousPollPublishedObject } = action.payload;
      state.previousPollPublishedCollection[previousPollPublishedObject._id] =
        action.payload.previousPollPublishedObject.extra.pollResultData;
    },
    addPreviousPollPublishedViaChat: (state, action) => {
      const { previousPollPublishedObject } = action.payload;
      state.previousPollPublishedCollection[previousPollPublishedObject.id] =
        action.payload.previousPollPublishedObject.fields.extra.pollResultData;
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
export const { addPreviousPollPublished, addPreviousPollPublishedViaChat } =
  previousPollPublishedSlice.actions;
export default previousPollPublishedSlice.reducer;
