import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isMuted: true,
  isConnected: false,
  isConnecting: false,
  isReconnecting: false,
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
    setIsReconnecting: (state, action) => {
      state.isReconnecting = action.payload;
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
  setIsReconnecting,
} = audioSlice.actions;
export default audioSlice.reducer;
