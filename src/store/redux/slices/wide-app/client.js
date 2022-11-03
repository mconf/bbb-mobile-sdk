import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  connected: false,
  loggedIn: false,
  loggingOut: false,
  loggingIn: false,
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
  },
});

export const {
  setConnected,
  setLoggedIn,
  setLoggingOut,
  setLoggingIn,
} = clientSlice.actions;

export default clientSlice.reducer;
