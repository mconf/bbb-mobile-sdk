import { createSlice, createSelector } from '@reduxjs/toolkit';

const recordMeetingsSlice = createSlice({
  name: 'record-meetings',
  initialState: {
    recordMeetingsCollection: {},
    ready: false,
  },
  reducers: {
    addRecordMeeting: (state, action) => {
      const { meetingObject } = action.payload;
      state.recordMeetingsCollection[meetingObject.id] =
        action.payload.meetingObject.fields;
    },
    removeRecordMeeting: (state, action) => {
      const { meetingObject } = action.payload;
      delete state.recordMeetingsCollection[
        meetingObject.id
      ];
    },
    editRecordMeeting: (state, action) => {
      const { meetingObject } = action.payload;
      state.recordMeetingsCollection[meetingObject.id] = {
        ...state.recordMeetingsCollection[meetingObject.id],
        ...action.payload.meetingObject.fields,
      };
    },
    readyStateChanged: (state, action) => {
      state.ready = action.payload;
    },
    cleanupStaleData: (state, action) => {
      const currentSubscriptionId = action.payload;
      if (state?.recordMeetingsCollection) {
        Object.entries(state?.recordMeetingsCollection)
          .forEach(([id, document]) => {
            const { subscriptionId } = document;

            if (typeof subscriptionId !== 'string') return;

            if (subscriptionId !== currentSubscriptionId) {
              delete state.recordMeetingsCollection[id];
            }
          });
      }
    }
  },
});

const selectRecordMeeting = (state) => Object.values(state.recordMeetingsCollection.recordMeetingsCollection)[0];

const allowStartStopRecording = createSelector(
  [selectRecordMeeting],
  (recordMeeting) => {
    return recordMeeting?.allowStartStopRecording;
  }
);

const autoStartRecording = createSelector(
  [selectRecordMeeting],
  (recordMeeting) => {
    return recordMeeting?.autoStartRecording;
  }
);

export const {
  addRecordMeeting,
  removeRecordMeeting,
  editRecordMeeting,
  readyStateChanged,
  cleanupStaleData,
} = recordMeetingsSlice.actions;

export {
  selectRecordMeeting,
  allowStartStopRecording,
  autoStartRecording,
};

export default recordMeetingsSlice.reducer;
