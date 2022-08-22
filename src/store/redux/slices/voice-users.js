import { createSlice } from '@reduxjs/toolkit';

const voiceUsersSlice = createSlice({
  name: 'voiceUsers',
  initialState: {
    voiceUsersCollection: {},
  },
  reducers: {
    addVoiceUser: (state, action) => {
      const { voiceUserObject } = action.payload;
      state.voiceUsersCollection[voiceUserObject.id] =
        action.payload.voiceUserObject.fields;
    },
    removeVoiceUser: (state, action) => {
      const { voiceUserObject } = action.payload;
      delete state.voiceUsersCollection[voiceUserObject.id];
    },
    editVoiceUser: (state, action) => {
      const { voiceUserObject } = action.payload;
      state.voiceUsersCollection[voiceUserObject.id] = {
        ...state.voiceUsersCollection[voiceUserObject.id],
        ...action.payload.voiceUserObject.fields,
      };
    },
  },
});
export const { addVoiceUser, removeVoiceUser, editVoiceUser } =
  voiceUsersSlice.actions;
export default voiceUsersSlice.reducer;
