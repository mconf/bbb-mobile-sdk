import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isMuted: true,
  isConnected: false,
  isConnecting: false,
  isReconnecting: false,
  isHangingUp: false,
  isListenOnly: false,
  inputStreamId: null,
  audioError: null,
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
    setInputStreamId: (state, action) => {
      state.inputStreamId = action.payload;
    },
    setIsListenOnly: (state, action) => {
      state.isListenOnly = action.payload;
    },
    setAudioError: (state, action) => {
      state.audioError = action.payload;
    },
  },
});

export const {
  setMutedState,
  setInputStreamId,
  setIsConnecting,
  setIsHangingUp,
  setIsConnected,
  setIsReconnecting,
  setIsListenOnly,
  setAudioError,
} = audioSlice.actions;
export default audioSlice.reducer;
