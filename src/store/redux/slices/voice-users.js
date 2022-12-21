import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AudioManager from '../../../services/webrtc/audio-manager';
import { setLoggedIn } from './wide-app/client';
import { addMeeting, selectMeeting, selectLockSettingsProp } from './meeting';
import { addCurrentUser, selectCurrentUser, isLocked } from './current-user';
import { setAudioError } from './wide-app/audio';
import logger from '../../../services/logger';

const voiceUsersSlice = createSlice({
  name: 'voiceUsers',
  initialState: {
    voiceUsersCollection: {},
    ready: false,
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
    readyStateChanged: (state, action) => {
      state.ready = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(joinAudio.pending, () => {
        // TODO move state updates from AudioManager to here
      })
      .addCase(joinAudio.fulfilled, () => {
        // TODO move state updates from AudioManager to here
      })
      .addCase(joinAudio.rejected, () => {
        // TODO move state updates from AudioManager to here
      });
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
  return true;
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

const joinAudioOnLoginPredicate = (action, state) => {
  return (setLoggedIn.match(action) || addMeeting.match(action) || addCurrentUser.match(action))
    && selectMeeting(state)
    && selectCurrentUser(state)
    && state.client.sessionState.loggedIn
    && !state.audio.isConnected
    && !state.audio.isConnecting
    && !state.audio.isReconnecting;
};

const joinAudioOnLoginListener = (action, listenerApi) => {
  listenerApi.dispatch(joinAudio()).unwrap().then(() => {
    // If user joined as listen only, it means they are locked which is a soft
    // error that needs to be surfaced
    if (listenerApi.getState().audio.isListenOnly) {
      listenerApi.dispatch(setAudioError('ListenOnly'));
    }
  }).catch((error) => {
    listenerApi.dispatch(setAudioError(error.name));
  });
};

const joinAudio = createAsyncThunk(
  'client/joinAudio',
  async (_, thunkAPI) => {
    const state = thunkAPI.getState();
    const muteOnStart = selectMeeting(state)?.voiceProp?.muteOnStart;
    const micDisabled = selectLockSettingsProp(state, 'disableMic') && isLocked(state);

    return AudioManager.joinMicrophone({
      muted: muteOnStart,
      isListenOnly: micDisabled,
    }).catch((error) => {
      logger.error({
        logCode: 'audio_publish_failure',
        extraInfo: {
          errorCode: error.code,
          errorMessage: error.message,
        }
      }, `Audio published failed: ${error.message}`);

      throw error;
    });
  },
);

export const {
  addVoiceUser,
  removeVoiceUser,
  editVoiceUser,
  readyStateChanged,
} = voiceUsersSlice.actions;

export {
  selectVoiceUserByDocumentId,
  voiceStateChangeListener,
  voiceStateChangePredicate,
  joinAudioOnLoginListener,
  joinAudioOnLoginPredicate,
  joinAudio,
};

export default voiceUsersSlice.reducer;
