import { createSlice } from '@reduxjs/toolkit';

const usersSettingsSlice = createSlice({
  name: 'users-settings',
  initialState: {
    usersSettingsCollection: {},
    ready: false,
  },
  reducers: {
    addUsersSettings: (state, action) => {
      const { usersSettingsObject } = action.payload;
      state.usersSettingsCollection[usersSettingsObject.id] = action
        .payload.usersSettingsObject.fields;
    },
    removeUsersSettings: (state, action) => {
      const { usersSettingsObject } = action.payload;
      delete state.usersSettingsCollection[usersSettingsObject.id];
    },
    editUsersSettings: (state, action) => {
      const { usersSettingsObject } = action.payload;
      state.usersSettingsCollection[usersSettingsObject.id] = {
        ...state.usersSettingsCollection[usersSettingsObject.id],
        ...action.payload.usersSettingsObject.fields,
      };
    },
    readyStateChanged: (state, action) => {
      state.ready = action.payload;
    },
    cleanupStaleData: (state, action) => {
      const currentSubscriptionId = action.payload;
      if (state?.usersSettingsCollection) {
        Object.entries(state?.usersSettingsCollection)
          .forEach(([id, document]) => {
            const { subscriptionId } = document;

            if (typeof subscriptionId !== 'string') return;

            if (subscriptionId !== currentSubscriptionId) {
              delete state.usersSettingsCollection[id];
            }
          });
      }
    },
  },
});

export const {
  addUsersSettings,
  removeUsersSettings,
  editUsersSettings,
  readyStateChanged,
  cleanupStaleData,
} = usersSettingsSlice.actions;

export default usersSettingsSlice.reducer;
