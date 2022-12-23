import { createSlice } from '@reduxjs/toolkit';

const padsSlice = createSlice({
  name: 'pads',
  initialState: {
    padsCollection: {},
    ready: false,
  },
  reducers: {
    addPad: (state, action) => {
      const { padObject } = action.payload;
      state.padsCollection[padObject.id] = action.payload.padObject.fields;
    },
    removePad: (state, action) => {
      const { padObject } = action.payload;
      delete state.padsCollection[padObject.id];
    },
    editPad: (state, action) => {
      const { padObject } = action.payload;
      state.padsCollection[padObject.id] = {
        ...state.padsCollection[padObject.id],
        ...action.payload.padObject.fields,
      };
    },
    readyStateChanged: (state, action) => {
      state.ready = action.payload;
    },
    cleanupStaleData: (state, action) => {
      const currentSubscriptionId = action.payload;
      if (state?.padsCollection) {
        Object.entries(state?.padsCollection)
          .forEach(([id, document]) => {
            const { subscriptionId } = document;

            if (typeof subscriptionId !== 'string') return;

            if (subscriptionId !== currentSubscriptionId) {
              delete state.padsCollection[id];
            }
          });
      }
    },
  },
});

export const {
  addPad,
  removePad,
  editPad,
  readyStateChanged,
  cleanupStaleData,
} = padsSlice.actions;
export default padsSlice.reducer;
