import { createSlice } from '@reduxjs/toolkit';

const videoStreamsSlice = createSlice({
  name: 'video-streams',
  initialState: {
    videoStreamsCollection: {},
  },
  reducers: {
    addVideoStream: (state, action) => {
      const { videoStreamObject } = action.payload;
      state.videoStreamsCollection[videoStreamObject.id] =
        action.payload.videoStreamObject.fields;
    },
    removeVideoStream: (state, action) => {
      const { videoStreamObject } = action.payload;
      delete state.videoStreamsCollection[videoStreamObject.id];
    },
    editVideoStream: (state, action) => {
      const { videoStreamObject } = action.payload;
      state.videoStreamsCollection[videoStreamObject.id] = {
        ...state.videoStreamsCollection[videoStreamObject.id],
        ...action.payload.videoStreamObject.fields,
      };
    },
  },
});

export const { addVideoStream, removeVideoStream, editVideoStream } =
  videoStreamsSlice.actions;
export default videoStreamsSlice.reducer;
