import { createSlice } from '@reduxjs/toolkit';

const externalVideoMeetingsSlice = createSlice({
  name: 'external-video-meetings',
  initialState: {
    externalVideoMeetingsCollection: {},
    streamExternalVideoMeeting: {
      meetingId: '',
      userId: '',
      rate: 0,
      time: 0,
      state: 0,
    },
    ready: false,
  },
  reducers: {
    addExternalVideoMeeting: (state, action) => {
      const { externalVideoMeetingObject } = action.payload;
      state.externalVideoMeetingsCollection[externalVideoMeetingObject.id] = action
        .payload.externalVideoMeetingObject.fields;
    },
    removeExternalVideoMeeting: (state, action) => {
      const { externalVideoMeetingObject } = action.payload;
      delete state.externalVideoMeetingsCollection[
        externalVideoMeetingObject.id
      ];
    },
    editExternalVideoMeeting: (state, action) => {
      const { externalVideoMeetingObject } = action.payload;
      state.externalVideoMeetingsCollection[externalVideoMeetingObject.id] = {
        ...state.externalVideoMeetingsCollection[externalVideoMeetingObject.id],
        ...action.payload.externalVideoMeetingObject.fields,
      };
    },
    editStreamExternalVideoMeeting: (state, action) => {
      const { streamExternalVideoMeetingObject } = action.payload;
      state.streamExternalVideoMeeting[streamExternalVideoMeetingObject.id] = {
        ...state.streamExternalVideoMeeting[streamExternalVideoMeetingObject.id],
        ...action.payload.streamExternalVideoMeetingObject.fields,
      };
    },

    readyStateChanged: (state, action) => {
      state.ready = action.payload;
    },
    cleanupStaleData: (state, action) => {
      const currentSubscriptionId = action.payload;
      if (state?.externalVideoMeetingsCollection) {
        Object.entries(state?.externalVideoMeetingsCollection)
          .forEach(([id, document]) => {
            const { subscriptionId } = document;

            if (typeof subscriptionId !== 'string') return;

            if (subscriptionId !== currentSubscriptionId) {
              delete state.externalVideoMeetingsCollection[id];
            }
          });
      }
    }
  },
});

export const {
  addExternalVideoMeeting,
  removeExternalVideoMeeting,
  editExternalVideoMeeting,
  readyStateChanged,
  cleanupStaleData,
  // stream
  editStreamExternalVideoMeeting,
} = externalVideoMeetingsSlice.actions;
export default externalVideoMeetingsSlice.reducer;
