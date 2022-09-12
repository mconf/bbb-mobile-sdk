import { createSlice } from '@reduxjs/toolkit';

const voiceCallStatesSlice = createSlice({
  name: 'voice-call-states',
  initialState: {
    voiceCallStatesCollection: {},
  },
  reducers: {
    addVoiceCallState: (state, action) => {
      const { voiceCallStateObject } = action.payload;
      state.voiceCallStatesCollection[voiceCallStateObject.id] =
        action.payload.voiceCallStateObject.fields;
    },
    removeVoiceCallState: (state, action) => {
      const { voiceCallStateObject } = action.payload;
      delete state.voiceCallStatesCollection[voiceCallStateObject.id];
    },
    editVoiceCallState: (state, action) => {
      const { voiceCallStateObject } = action.payload;
      state.voiceCallStatesCollection[voiceCallStateObject.id] = {
        ...state.voiceCallStatesCollection[voiceCallStateObject.id],
        ...action.payload.voiceCallStateObject.fields,
      };
    },
  },
});
export const { addVoiceCallState, removeVoiceCallState, editVoiceCallState } =
  voiceCallStatesSlice.actions;
export default voiceCallStatesSlice.reducer;
