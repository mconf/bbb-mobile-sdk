import { createSlice } from '@reduxjs/toolkit';

const presentationsSlice = createSlice({
  name: 'presentations',
  initialState: {
    presentationsCollection: {},
    ready: false,
  },
  reducers: {
    addPresentation: (state, action) => {
      const { presentationObject } = action.payload;
      state.presentationsCollection[presentationObject.id] = action
        .payload.presentationObject.fields;
    },
    removePresentation: (state, action) => {
      const { presentationObject } = action.payload;
      delete state.presentationsCollection[presentationObject.id];
    },
    editPresentation: (state, action) => {
      const { presentationObject } = action.payload;
      state.presentationsCollection[presentationObject.id] = {
        ...state.presentationsCollection[presentationObject.id],
        ...action.payload.presentationObject.fields,
      };
    },
    readyStateChanged: (state, action) => {
      state.ready = action.payload;
    },
    cleanupStaleData: (state, action) => {
      const currentSubscriptionId = action.payload;
      if (state?.presentationsCollection) {
        Object.entries(state?.presentationsCollection)
          .forEach(([id, document]) => {
            const { subscriptionId } = document;

            if (typeof subscriptionId !== 'string') return;

            if (subscriptionId !== currentSubscriptionId) {
              delete state.presentationsCollection[id];
            }
          });
      }
    },
  },
});

export const {
  addPresentation,
  removePresentation,
  editPresentation,
  readyStateChanged,
  cleanupStaleData,
} = presentationsSlice.actions;
export default presentationsSlice.reducer;
