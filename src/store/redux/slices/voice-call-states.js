import { createSlice } from '@reduxjs/toolkit';

const voiceCallStatesSlice = createSlice({
  name: 'voice-call-states',
  initialState: {
    voiceCallStatesCollection: {},
    ready: false,
  },
  reducers: {
    addVoiceCallState: (state, action) => {
      const { voiceCallStateObject } = action.payload;
      state.voiceCallStatesCollection[voiceCallStateObject.id] = voiceCallStateObject.fields;
    },
    removeVoiceCallState: (state, action) => {
      const { voiceCallStateObject } = action.payload;
      delete state.voiceCallStatesCollection[voiceCallStateObject.id];
    },
    editVoiceCallState: (state, action) => {
      const { voiceCallStateObject } = action.payload;
      state.voiceCallStatesCollection[voiceCallStateObject.id] = {
        ...state.voiceCallStatesCollection[voiceCallStateObject.id],
        ...voiceCallStateObject.fields,
      };
    },
    readyStateChanged: (state, action) => {
      state.ready = action.payload;
    },
    cleanupStaleData: (state, action) => {
      const currentSubscriptionId = action.payload;
      if (state?.voiceCallStatesCollection) {
        Object.entries(state?.voiceCallStatesCollection)
          .forEach(([id, document]) => {
            const { subscriptionId } = document;

            if (typeof subscriptionId !== 'string') return;

            if (subscriptionId !== currentSubscriptionId) {
              delete state.voiceCallStatesCollection[id];
            }
          });
      }
    },
  },
});

// Selectors
const selectVoiceCallStateByDocumentId = (state, documentId) => {
  return state.voiceCallStatesCollection.voiceCallStatesCollection[documentId];
};

// Middleware effects and listeners.
// Listener predicates only receive (action, currentState, originalState) - no
// listenerApi - so the predicate closes over the AppInstance whose store the
// observer is installed in (see middlewares/voiceCallStateObserver.js).
const createVoiceCallStateChangePredicate = (instance) => (action, currentState) => {
  if (!editVoiceCallState.match(action) && !addVoiceCallState.match(action)) return false;
  const { audioManager } = instance;
  const { voiceCallStateObject } = action.payload;
  const currentVoiceCallState = selectVoiceCallStateByDocumentId(
    currentState,
    voiceCallStateObject.id
  );

  // Not for us - skip
  if (currentVoiceCallState.userId !== audioManager.userId
    // eslint-disable-next-line eqeqeq
    || currentVoiceCallState.clientSession != audioManager.getCurrentAudioSessionNumber()
  ) {
    return false;
  }

  return true;
};

// Effects reach the per-instance managers through listenerApi.extra (the
// AppInstance passed to createListenerMiddleware({ extra })).
const voiceCallStateChangeListener = (action, listenerApi) => {
  const { audioManager: AudioManager, invalidateInFlightAudioJoin } = listenerApi.extra;
  const currentState = listenerApi.getState();
  const previousState = listenerApi.getOriginalState();
  const { voiceCallStateObject } = action.payload;
  const currentVoiceCallState = selectVoiceCallStateByDocumentId(
    currentState,
    voiceCallStateObject.id
  );
  const previousVoiceCallState = selectVoiceCallStateByDocumentId(
    previousState,
    voiceCallStateObject.id
  );

  if (currentVoiceCallState?.callState !== previousVoiceCallState?.callState
    // eslint-disable-next-line eqeqeq
    && currentVoiceCallState?.clientSession == AudioManager.audioSessionNumber) {
    switch (currentVoiceCallState?.callState) {
      case 'IN_CONFERENCE':
        AudioManager.onAudioJoin(currentVoiceCallState?.clientSession);
        break;
      case 'CALL_ENDED':
        if (currentState.audio.isConnected
          || currentState.audio.isConnecting) {
          invalidateInFlightAudioJoin();
          AudioManager.exitAudio();
        }
        break;
      default:
        break;
    }
  }
};

export const {
  addVoiceCallState,
  removeVoiceCallState,
  editVoiceCallState,
  readyStateChanged,
  cleanupStaleData,
} = voiceCallStatesSlice.actions;

export {
  selectVoiceCallStateByDocumentId,
  voiceCallStateChangeListener,
  createVoiceCallStateChangePredicate,
};

export default voiceCallStatesSlice.reducer;
