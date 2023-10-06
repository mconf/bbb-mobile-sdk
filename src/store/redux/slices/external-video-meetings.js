import { createSlice } from '@reduxjs/toolkit';

const externalVideoMeetingsSlice = createSlice({
  name: 'external-video-meetings',
  initialState: {
    externalVideoMeetingsCollection: {},
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
} = externalVideoMeetingsSlice.actions;
export default externalVideoMeetingsSlice.reducer;
