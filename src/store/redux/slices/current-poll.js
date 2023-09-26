import { createSelector, createSlice } from '@reduxjs/toolkit';

// currentPoll is a collection exclusive for the poll publisher.
// Refers to the state after the poll was started, and before the poll has been published.
const currentPollSlice = createSlice({
  name: 'current-poll',
  initialState: {
    currentPollCollection: {},
    ready: false,
  },
  reducers: {
    addCurrentPoll: (state, action) => {
      const { currentPollObject } = action.payload;
      state.currentPollCollection[currentPollObject.id] = action.payload.currentPollObject.fields;
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
    readyStateChanged: (state, action) => {
      state.ready = action.payload;
    },
    cleanupStaleData: (state, action) => {
      const currentSubscriptionId = action.payload;
      if (state?.currentPollCollection) {
        Object.entries(state?.currentPollCollection)
          .forEach(([id, document]) => {
            const { subscriptionId } = document;

            if (typeof subscriptionId !== 'string') return;

            if (subscriptionId !== currentSubscriptionId) {
              delete state.currentPollCollection[id];
            }
          });
      }
    },
  },
});

// Selectors
const selectCurrentPoll = (state) => Object.values(
  state.currentPollCollection?.currentPollCollection
)[0];

const hasCurrentPollSelector = createSelector(
  [selectCurrentPoll],
  (currentPoll) => Object.keys(currentPoll || {})?.length !== 0
);

export const {
  addCurrentPoll,
  removeCurrentPoll,
  editCurrentPoll,
  readyStateChanged,
  cleanupStaleData,
} = currentPollSlice.actions;

export {
  selectCurrentPoll,
  hasCurrentPollSelector,
};

export default currentPollSlice.reducer;
