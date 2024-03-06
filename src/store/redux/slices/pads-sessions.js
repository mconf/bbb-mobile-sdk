import { createSlice } from '@reduxjs/toolkit';

const padsSessionsSlice = createSlice({
  name: 'pads-sessions',
  initialState: {
    padsSessionsCollection: {},
    ready: false,
  },
  reducers: {
    addPadSession: (state, action) => {
      const { padSessionObject } = action.payload;
      state.padsSessionsCollection[padSessionObject.id] = action.payload.padSessionObject.fields;
    },
    removePadSession: (state, action) => {
      const { padSessionObject } = action.payload;
      delete state.padsSessionsCollection[padSessionObject.id];
    },
    editPadSession: (state, action) => {
      const { padSessionObject } = action.payload;
      state.padsSessionsCollection[padSessionObject.id] = {
        ...state.padsSessionsCollection[padSessionObject.id],
        ...action.payload.padSessionObject.fields,
      };
    },
    readyStateChanged: (state, action) => {
      state.ready = action.payload;
    },
    cleanupStaleData: (state, action) => {
      const currentSubscriptionId = action.payload;
      if (state?.padsSessionsCollection) {
        Object.entries(state?.padsSessionsCollection)
          .forEach(([id, document]) => {
            const { subscriptionId } = document;

            if (typeof subscriptionId !== 'string') return;

            if (subscriptionId !== currentSubscriptionId) {
              delete state.padsSessionsCollection[id];
            }
          });
      }
    },
  },
});

const selectPadSession = (state) => Object.values(
  state.padsSessionsCollection.padsSessionsCollection
)[0]?.sessions[0]?.notes;

export const {
  addPadSession,
  removePadSession,
  editPadSession,
  readyStateChanged,
  cleanupStaleData,
} = padsSessionsSlice.actions;

export {
  selectPadSession,
};

export default padsSessionsSlice.reducer;
