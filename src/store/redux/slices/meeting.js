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

export const {
  addMeeting,
  removeMeeting,
  editMeeting,
  readyStateChanged,
} = meetingSlice.actions;

export {
  selectMeeting,
  selectAllLockSettingsProps,
  selectLockSettingsProp,
};

export default meetingSlice.reducer;
