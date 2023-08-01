import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { Platform, PermissionsAndroid } from 'react-native';
import AudioManager from '../../../services/webrtc/audio-manager';
import { setLoggedIn } from './wide-app/client';
import { addMeeting, selectMeeting, selectLockSettingsProp } from './meeting';
import { addCurrentUser, selectCurrentUser, isLocked } from './current-user';
import { setAudioError } from './wide-app/audio';
import logger from '../../../services/logger';

const ANDROID_SDK_MIN_BTCONNECT = 31;

const voiceUsersSlice = createSlice({
  name: 'voiceUsers',
  initialState: {
    voiceUsersCollection: {},
    userIdMatchDocumentId: {},
    ready: false,
  },
  reducers: {
    addVoiceUser: (state, action) => {
      const { voiceUserObject } = action.payload;
      state.voiceUsersCollection[voiceUserObject.id] = voiceUserObject.fields;
      state.userIdMatchDocumentId[voiceUserObject.fields.intId] = voiceUserObject.id;
    },
    removeVoiceUser: (state, action) => {
      const { voiceUserObject } = action.payload;
      const userId = selectUserIdByDocumentId(voiceUserObject.id);
      if (userId) delete state.userIdMatchDocumentId[userId];
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
    cleanupStaleData: (state, action) => {
      const currentSubscriptionId = action.payload;
      if (state?.voiceUsersCollection) {
        Object.entries(state?.voiceUsersCollection)
          .forEach(([id, document]) => {
            const { subscriptionId } = document;

            if (typeof subscriptionId !== 'string') return;

            if (subscriptionId !== currentSubscriptionId) {
              delete state.voiceUsersCollection[id];
            }
          });
      }
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
  if (state?.voiceUsersCollection?.voiceUsersCollection == null) return null;
  return state.voiceUsersCollection.voiceUsersCollection[documentId];
};

const selectVoiceUserByUserId = (state, userId) => {
  if (state?.voiceUsersCollection?.voiceUsersCollection == null) return null;
  const documentId = state.voiceUsersCollection.userIdMatchDocumentId[userId];
  return state.voiceUsersCollection.voiceUsersCollection[documentId];
};

const selectUserIdByDocumentId = (state, documentId) => {
  return selectVoiceUserByDocumentId(state, documentId)?.intId;
};

const isTalkingByUserId = createSelector(
  (state, userId) => selectVoiceUserByUserId(state, userId),
  (voiceUserObj) => voiceUserObj?.talking
);

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
  if (action.type !== 'client/setLoggedIn') {
    return;
  }
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

    if (Platform.OS === 'android' && Platform.Version >= ANDROID_SDK_MIN_BTCONNECT) {
      const checkStatus = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
      );

      if (checkStatus === false) {
        const permissionStatus = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
        );
        logger.info({
          logCode: 'audio_bluetooth_permission',
          extraInfo: {
            checkStatus,
            permissionStatus,
          }
        }, `Audio had to explicitly request BT permission, result=${permissionStatus}`);
      }
    }

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
  cleanupStaleData,
} = voiceUsersSlice.actions;

export {
  selectVoiceUserByDocumentId,
  selectVoiceUserByUserId,
  voiceStateChangeListener,
  voiceStateChangePredicate,
  joinAudioOnLoginListener,
  joinAudioOnLoginPredicate,
  joinAudio,
  isTalkingByUserId,
};

export default voiceUsersSlice.reducer;
