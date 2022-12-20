import { createSlice } from '@reduxjs/toolkit';

const pollsSlice = createSlice({
  name: 'polls',
  initialState: {
    pollsCollection: {},
    ready: false,
  },
  reducers: {
    addPoll: (state, action) => {
      const { pollObject } = action.payload;
      state.pollsCollection[pollObject.id] = action.payload.pollObject.fields;
    },
    removePoll: (state, action) => {
      const { pollObject } = action.payload;
      delete state.pollsCollection[pollObject.id];
    },
    editPoll: (state, action) => {
      const { pollObject } = action.payload;
      state.pollsCollection[pollObject.id] = {
        ...state.pollsCollection[pollObject.id],
        ...action.payload.pollObject.fields,
      };
    },
    readyStateChanged: (state, action) => {
      state.ready = action.payload;
    },
  },
});
export const {
  addPoll,
  removePoll,
  editPoll,
  readyStateChanged,
} = pollsSlice.actions;
export default pollsSlice.reducer;
