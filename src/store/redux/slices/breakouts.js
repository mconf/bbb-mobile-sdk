import { createSlice } from '@reduxjs/toolkit';

const breakoutsSlice = createSlice({
  name: 'breakouts',
  initialState: {
    breakoutsCollection: {},
    timeRemaining: 0,
    ready: false,
  },
  reducers: {
    addBreakout: (state, action) => {
      const { breakoutObject } = action.payload;
      state.breakoutsCollection[breakoutObject.id] = action.payload.breakoutObject.fields;
    },
    removeBreakout: (state, action) => {
      const { breakoutObject } = action.payload;
      delete state.breakoutsCollection[breakoutObject.id];
    },
    editBreakout: (state, action) => {
      const { breakoutObject } = action.payload;
      state.breakoutsCollection[breakoutObject.id] = {
        ...state.breakoutsCollection[breakoutObject.id],
        ...action.payload.breakoutObject.fields,
      };
    },
    editTimeRemaining: (state, action) => {
      const { timeRemaining } = action.payload;
      state.timeRemaining = timeRemaining;
    },
    readyStateChanged: (state, action) => {
      state.ready = action.payload;
    },
    cleanupStaleData: (state, action) => {
      const currentSubscriptionId = action.payload;
      if (state?.breakoutsCollection) {
        Object.entries(state?.breakoutsCollection)
          .forEach(([id, document]) => {
            const { subscriptionId } = document;

            if (typeof subscriptionId !== 'string') return;

            if (subscriptionId !== currentSubscriptionId) {
              delete state.breakoutsCollection[id];
            }
          });
      }
    },
  },
});

// Selectors

export const {
  addBreakout,
  removeBreakout,
  editBreakout,
  readyStateChanged,
  cleanupStaleData,
  editTimeRemaining,
} = breakoutsSlice.actions;

export default breakoutsSlice.reducer;
