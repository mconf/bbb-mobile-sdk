import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isMuted: true,
  isConnected: false,
  isConnecting: false,
  isHangingUp: false,
  audioStream: null,
};

const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    setMutedState: (state, action) => {
      state.isMuted = action.payload;
    },
    setIsConnecting: (state, action) => {
      state.isConnecting = action.payload;
    },
    setIsConnected: (state, action) => {
      state.isConnected = action.payload;
    },
    setIsHangingUp: (state, action) => {
      state.isHangingUp = action.payload;
    },
    setAudioStream: (state, action) => {
      state.inputStream = action.payload;
    },
  },
});

export const {
  setMutedState,
  setAudioStream,
  setIsConnecting,
  setIsHangingUp,
  setIsConnected,
} = audioSlice.actions;
export default audioSlice.reducer;
