import { createSlice } from '@reduxjs/toolkit';

// currentPoll is a collection exclusive for the poll publisher.
// Refers to the state after the poll was started, and before the poll has been published.
const currentPollSlice = createSlice({
  name: 'current-poll',
  initialState: {
    currentPollCollection: {},
  },
  reducers: {
    addCurrentPoll: (state, action) => {
      const { currentPollObject } = action.payload;
      state.currentPollCollection[currentPollObject.id] =
        action.payload.currentPollObject.fields;
    },
    removeCurrentPoll: (state, action) => {
      const { currentPollObject } = action.payload;
      delete state.currentPollCollection[currentPollObject.id];
    },
    editCurrentPoll: (state, action) => {
      const { currentPollObject } = action.payload;
      state.currentPollCollection[currentPollObject.id] = {
        ...state.currentPollCollection[currentPollObject.id],
        ...action.payload.currentPollObject.fields,
      };
    },
  },
});
export const { addCurrentPoll, removeCurrentPoll, editCurrentPoll } =
  currentPollSlice.actions;
export default currentPollSlice.reducer;
