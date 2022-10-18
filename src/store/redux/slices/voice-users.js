import { createSlice } from '@reduxjs/toolkit';
import AudioManager from '../../../services/webrtc/audio-manager';

const voiceUsersSlice = createSlice({
  name: 'voiceUsers',
  initialState: {
    voiceUsersCollection: {},
  },
  reducers: {
    addVoiceUser: (state, action) => {
      const { voiceUserObject } = action.payload;
      state.voiceUsersCollection[voiceUserObject.id] = voiceUserObject.fields;
    },
    removeVoiceUser: (state, action) => {
      const { voiceUserObject } = action.payload;
      delete state.voiceUsersCollection[voiceUserObject.id];
    },
    editVoiceUser: (state, action) => {
      const { voiceUserObject } = action.payload;
      state.voiceUsersCollection[voiceUserObject.id] = {
        ...state.voiceUsersCollection[voiceUserObject.id],
        ...voiceUserObject.fields,
      };
    },
  },
});

// Selectors
const selectVoiceUserByDocumentId = (state, documentId) => {
  return state.voiceUsersCollection.voiceUsersCollection[documentId];
};

// Middleware effects and listeners
const voiceStateChangePredicate = (action, currentState) => {
  if (!editVoiceUser.match(action) && !addVoiceUser.match(action)) return false;
  const { voiceUserObject } = action.payload;
  const currentVoiceUser = selectVoiceUserByDocumentId(currentState, voiceUserObject.id);
  // Not for us - skip
  if (currentVoiceUser.intId !== AudioManager.userId) return false;
  // Currently only watching for mute state changes - add more cases when necessary
  return voiceUserObject?.muted !== currentState.audio.isMuted;
};

const voiceStateChangeListener = (action, listenerApi) => {
  const state = listenerApi.getState();
  const { voiceUserObject } = action.payload;
  const currentVoiceUser = selectVoiceUserByDocumentId(state, voiceUserObject.id);
  const { muted } = currentVoiceUser;

  if (typeof muted === 'boolean' && muted !== state.audio.isMuted) {
    AudioManager.setMutedState(muted);
  }
};

export const {
  addVoiceUser,
  removeVoiceUser,
  editVoiceUser,
} = voiceUsersSlice.actions;

export {
  selectVoiceUserByDocumentId,
  voiceStateChangeListener,
  voiceStateChangePredicate,
};

export default voiceUsersSlice.reducer;
