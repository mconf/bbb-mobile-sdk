import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isConnecting: false,
  isConnected: false,
  isHangingUp: false,
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
  },
});

export const {
  setIsConnecting,
  setIsConnected,
  setIsHangingUp,
  setVideoStream,
} = videoSlice.actions;
export default videoSlice.reducer;
