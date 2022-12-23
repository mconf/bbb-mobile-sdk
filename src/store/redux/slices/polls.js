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
    cleanupStaleData: (state, action) => {
      const currentSubscriptionId = action.payload;
      if (state?.pollsCollection) {
        Object.entries(state?.pollsCollection)
          .forEach(([id, document]) => {
            const { subscriptionId } = document;

            if (typeof subscriptionId !== 'string') return;

            if (subscriptionId !== currentSubscriptionId) {
              delete state.pollsCollection[id];
            }
          });
      }
    },
  },
});
export const {
  addPoll,
  removePoll,
  editPoll,
  readyStateChanged,
  cleanupStaleData,
} = pollsSlice.actions;
export default pollsSlice.reducer;
