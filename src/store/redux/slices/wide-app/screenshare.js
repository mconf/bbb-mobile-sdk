import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isConnecting: false,
  isConnected: false,
  isHangingUp: false,
  screenshareStream: null,
  // Local (publisher-side) screenshare state. The fields above track the
  // *viewer* side driven by the SFU ScreenshareManager; these track the
  // current user's own share (LiveKit only for now).
  isLocalSharing: false,
  isLocalConnecting: false,
  localScreenshareId: null,
};

const screenshareSlice = createSlice({
  name: 'screenshare',
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
    setIsReconnecting: (state, action) => {
      state.isReconnecting = action.payload;
    },
    addScreenshareStream: (state, action) => {
      state.screenshareStream = action.payload;
    },
    removeScreenshareStream: (state) => {
      state.screenshareStream = null;
    },
    setIsLocalSharing: (state, action) => {
      state.isLocalSharing = action.payload;
    },
    setIsLocalConnecting: (state, action) => {
      state.isLocalConnecting = action.payload;
    },
    setLocalScreenshareId: (state, action) => {
      state.localScreenshareId = action.payload;
    },
  },
});

export const {
  setIsConnecting,
  setIsConnected,
  setIsHangingUp,
  setIsReconnecting,
  addScreenshareStream,
  removeScreenshareStream,
  setIsLocalSharing,
  setIsLocalConnecting,
  setLocalScreenshareId,
} = screenshareSlice.actions;
export default screenshareSlice.reducer;
