import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isConnecting: false,
  isConnected: false,
  isHangingUp: false,
  signalingTransportOpen: false,
  videoStreams: {},
  localCameraId: null,
  userRequestedHangup: false,
};

const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    setIsConnecting: (state, action) => {
      state.isConnecting = action.payload;
    },
    setIsConnected: (state, action) => {
      state.isConnected = action.payload;
    },
    setIsHangingUp: (state, action) => {
      state.isHangingUp = action.payload;
    },
    setSignalingTransportOpen: (state, action) => {
      state.signalingTransportOpen = action.payload;
    },
    setLocalCameraId: (state, action) => {
      state.localCameraId = action.payload;
    },
    userRequestedHangup: (state, action) => {
      state.userRequestedHangup = action.payload;
    },
    addVideoStream: (state, action) => {
      const { cameraId, streamId } = action.payload;
      state.videoStreams[cameraId] = streamId;
    },
    removeVideoStream: (state, action) => {
      const { cameraId } = action.payload;
      delete state.videoStreams[cameraId];
    },
  },
});

const selectLocalCameraId = (state) => state.video.localCameraId;

export const {
  setIsConnecting,
  setIsConnected,
  setIsHangingUp,
  setSignalingTransportOpen,
  setLocalCameraId,
  userRequestedHangup,
  addVideoStream,
  removeVideoStream,
} = videoSlice.actions;

export {
  selectLocalCameraId,
};

export default videoSlice.reducer;
