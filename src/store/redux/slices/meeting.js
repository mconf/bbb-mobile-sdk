import { createSlice, createSelector } from '@reduxjs/toolkit';

const meetingSlice = createSlice({
  name: 'meeting',
  initialState: {
    meetingCollection: {},
    ready: false,
  },
  reducers: {
    addMeeting: (state, action) => {
      const { meetingObject } = action.payload;
      state.meetingCollection[meetingObject.id] = action.payload.meetingObject.fields;
    },
    removeMeeting: (state, action) => {
      const { meetingObject } = action.payload;
      delete state.meetingCollection[meetingObject.id];
    },
    editMeeting: (state, action) => {
      const { meetingObject } = action.payload;
      state.meetingCollection[meetingObject.id] = {
        ...state.meetingCollection[meetingObject.id],
        ...action.payload.meetingObject.fields,
      };
    },
    readyStateChanged: (state, action) => {
      state.ready = action.payload;
    },
    cleanupStaleData: (state, action) => {
      const currentSubscriptionId = action.payload;
      if (state?.meetingCollection) {
        Object.entries(state?.meetingCollection)
          .forEach(([id, document]) => {
            const { subscriptionId } = document;

            if (typeof subscriptionId !== 'string') return;

            if (subscriptionId !== currentSubscriptionId) {
              delete state.meetingCollection[id];
            }
          });
      }
    },
  },
});

const selectMeeting = (state) => Object.values(state.meetingCollection.meetingCollection)[0];

const selectProp = (state, prop) => prop;

const selectAllLockSettingsProps = createSelector(
  [selectMeeting],
  (meeting) => {
    return meeting?.lockSettingsProps ?? {};
  }
);

const selectLockSettingsProp = createSelector(
  [selectAllLockSettingsProps, selectProp],
  (lockSettings, prop) => {
    return lockSettings[prop] ?? false;
  }
);

const selectAllUsersProps = createSelector(
  [selectMeeting],
  (meeting) => {
    return meeting?.usersProp ?? {};
  }
);

const selectUsersProp = createSelector(
  [selectAllUsersProps, selectProp],
  (usersProps, prop) => {
    return usersProps[prop] ?? false;
  }
);

const selectAllMetadata = createSelector(
  [selectMeeting],
  (meeting) => {
    return meeting?.metadataProp ?? { metadata: {} };
  }
);

const selectMetadata = createSelector(
  [selectAllMetadata, selectProp],
  (metadataProp, prop) => {
    return metadataProp.metadata[prop];
  }
);

export const {
  addMeeting,
  removeMeeting,
  editMeeting,
  readyStateChanged,
  cleanupStaleData,
} = meetingSlice.actions;

export {
  selectMeeting,
  selectAllLockSettingsProps,
  selectLockSettingsProp,
  selectAllUsersProps,
  selectUsersProp,
  selectAllMetadata,
  selectMetadata,
};

export default meetingSlice.reducer;
