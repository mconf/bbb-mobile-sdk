import { createSlice } from '@reduxjs/toolkit';

const externalVideoMeetingsSlice = createSlice({
  name: 'external-video-meetings',
  initialState: {
    externalVideoMeetingsCollection: {},
  },
  reducers: {
    addExternalVideoMeeting: (state, action) => {
      const { externalVideoMeetingObject } = action.payload;
      state.externalVideoMeetingsCollection[externalVideoMeetingObject.id] =
        action.payload.externalVideoMeetingObject.fields;
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
  },
});
export const {
  addExternalVideoMeeting,
  removeExternalVideoMeeting,
  editExternalVideoMeeting,
} = externalVideoMeetingsSlice.actions;
export default externalVideoMeetingsSlice.reducer;
