import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  connected: false,
  loggedIn: false,
  loggingOut: false,
  loggingIn: false,
  sessionEnded: false,
  connectionStatus: {
    isConnected: null,
    isInternetReachable: null,
    isWifiEnabled: null,
    type: null,
    cellularGeneration: null,
    isConnectionExpensive: null,
    strength: null,
  }
};

const clientSlice = createSlice({
  name: 'client',
  initialState,
  reducers: {
    setConnected: (state, action) => {
      state.connected = action.payload;
    },
    setLoggedIn: (state, action) => {
      state.loggedIn = action.payload;
    },
    setLoggingOut: (state, action) => {
      state.loggingOut = action.payload;
    },
    setLoggingIn: (state, action) => {
      state.loggingIn = action.payload;
    },
    setSessionEnded: (state, action) => {
      state.sessionEnded = action.payload;
    },
    connectionStatusChanged: (state, action) => {
      const {
        isConnected,
        isInternetReachable,
        isWifiEnabled,
        type,
        details: {
          isConnectionExpensive = null,
          strength = null,
          cellularGeneration = null,
        } = {},
      } = action.payload;
      state.connectionStatus = {
        isConnected,
        isInternetReachable,
        isWifiEnabled,
        type,
        isConnectionExpensive,
        strength,
        cellularGeneration,
      };
    },
  },
});

export const {
  setConnected,
  setLoggedIn,
  setLoggingOut,
  setLoggingIn,
  setSessionEnded,
  connectionStatusChanged,
} = clientSlice.actions;

export default clientSlice.reducer;
