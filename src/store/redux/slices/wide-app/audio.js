import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  audioManagerInitialized: false,
  isMuted: true,
  isConnected: false,
  isConnecting: false,
  isReconnecting: false,
  isHangingUp: false,
  isListenOnly: false,
  inputStreamId: null,
  audioError: null,
  audioDevices: [],
  selectedAudioDevice: '',
  // Mute intent persistence keys to restore the user's previous choice of mute state
  // on select scenarios (breakout exit, reconnects etc). These serve as an
  // extra safety measure to prevent mute states from leaking across meetings
  // (store being flushed is not reliable as history has shown); and from leaking
  // across sessions (full reconnects).
  audioIntentMeetingId: null,
  audioIntentSessionToken: null,
  // Mute value to assert on the server via USER_SET_MUTED once a rejoin's voice
  // record exists. null = no assertion pending.
  pendingMuteAssert: null,
  // Epoch id for pendingMuteAssert, bumped on every setPendingMuteAssert dispatch.
  pendingMuteAssertEpoch: 0,
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
    setAudioDevices: (state, action) => {
      state.audioDevices = action.payload;
    },
    setSelectedAudioDevice: (state, action) => {
      state.selectedAudioDevice = action.payload;
    },
    setAudioManagerInitialized: (state, action) => {
      state.audioManagerInitialized = action.payload;
    },
    // payload: { meetingId, sessionToken }, null to clear.
    setAudioIntent: (state, action) => {
      state.audioIntentMeetingId = action.payload?.meetingId ?? null;
      state.audioIntentSessionToken = action.payload?.sessionToken ?? null;
    },
    setPendingMuteAssert: (state, action) => {
      state.pendingMuteAssert = action.payload;
      state.pendingMuteAssertEpoch += 1;
    },
  },
});

export const {
  setAudioManagerInitialized,
  setAudioIntent,
  setPendingMuteAssert,
  setMutedState,
  setInputStreamId,
  setIsConnecting,
  setIsHangingUp,
  setIsConnected,
  setIsReconnecting,
  setIsListenOnly,
  setAudioError,
  setAudioDevices,
  setSelectedAudioDevice,
} = audioSlice.actions;
export default audioSlice.reducer;
