import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isConnecting: false,
  isConnected: false,
  isHangingUp: false,
  signalingTransportOpen: false,
  videoStream: null,
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
    setVideoStream: (state, action) => {
      state.inputStream = action.payload;
    },
    setSignalingTransportOpen: (state, action) => {
      state.signalingTransportOpen = action.payload;
    }
  },
});

export const {
  setIsConnecting,
  setIsConnected,
  setIsHangingUp,
  setSignalingTransportOpen,
  setVideoStream,
} = videoSlice.actions;
export default videoSlice.reducer;
