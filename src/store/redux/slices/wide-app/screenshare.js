import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentUserScreenshare: false,
  isConnecting: false,
  isConnected: false,
  isHangingUp: false,
  screenshareStream: null,
};

const screenshareSlice = createSlice({
  name: 'screenshare',
  initialState,
  reducers: {
    setCurrentUserScreenshare: (state, action) => {
      state.currentUserScreenshare = action.payload;
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
    addScreenshareStream: (state, action) => {
      state.screenshareStream = action.payload;
    },
    removeScreenshareStream: (state) => {
      state.screenshareStream = null;
    },
  },
});

export const {
  setCurrentUserScreenshare,
  setIsConnecting,
  setIsConnected,
  setIsHangingUp,
  setIsReconnecting,
  addScreenshareStream,
  removeScreenshareStream,
} = screenshareSlice.actions;
export default screenshareSlice.reducer;
