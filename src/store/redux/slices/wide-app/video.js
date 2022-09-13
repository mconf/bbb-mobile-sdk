import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isConnecting: false,
  isConnected: false,
  isHangingUp: false,
  signalingTransportOpen: false,
  videoStreams: {},
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

export const {
  setIsConnecting,
  setIsConnected,
  setIsHangingUp,
  setSignalingTransportOpen,
  addVideoStream,
  removeVideoStream,
} = videoSlice.actions;
export default videoSlice.reducer;
