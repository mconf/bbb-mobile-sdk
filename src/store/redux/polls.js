import { createSlice } from '@reduxjs/toolkit';

const pollsSlice = createSlice({
  name: 'polls',
  initialState: {
    pollsCollection: {},
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
  },
});
export const { addPoll, removePoll, editPoll } = pollsSlice.actions;
export default pollsSlice.reducer;
