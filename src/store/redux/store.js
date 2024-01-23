import {
  combineReducers, configureStore, createListenerMiddleware, isAnyOf
} from '@reduxjs/toolkit';
import logger from '../../services/logger';
// meteor collections
import usersReducer from './slices/users';
import meetingReducer from './slices/meeting';
import voiceUsersReducer from './slices/voice-users';
import voiceCallStatesReducer from './slices/voice-call-states';
import pollsReducer from './slices/polls';
import padsReducer from './slices/pads';
import currentPollReducer from './slices/current-poll';
import groupChatReducer from './slices/group-chat';
import groupChatMsgReducer from './slices/group-chat-msg';
import currentUserReducer from './slices/current-user';
import presentationsReducer from './slices/presentations';
import slidesReducer from './slices/slides';
import externalVideoMeetingsReducer from './slices/external-video-meetings';
import videoStreamsReducer from './slices/video-streams';
import screenshareReducer from './slices/screenshare';
import guestUsersReducer from './slices/guest-users';
import breakoutsReducer from './slices/breakouts';
import recordMeetingsReducer from './slices/record-meetings';
import usersSettingsReducer from './slices/users-settings';
import uploadedFileReducer from './slices/uploaded-file';
import padsSessionsReducer from './slices/pads-sessions';
// app exclusive wide state collections
import previousPollPublishedReducer from './slices/wide-app/previous-poll-published';
import audioReducer from './slices/wide-app/audio';
import videoReducer from './slices/wide-app/video';
import debugReducer from './slices/wide-app/debug';
import localScreenshareReducer from './slices/wide-app/screenshare';
import chatReducer from './slices/wide-app/chat';
import notificationBarReducer from './slices/wide-app/notification-bar';
import modalReducer from './slices/wide-app/modal';
import layoutReducer from './slices/wide-app/layout';
import clientReducer, { setSessionTerminated, setConnected, sessionStateChanged } from './slices/wide-app/client';
// Loggers
import ReduxDebug from '../../services/logger/redux-debug';
// Middlewares
import {
  screenshareCleanupObserver,
  videoStreamCleanupObserver,
  voiceUserStateObserver,
  voiceCallStateObserver,
  joinAudioOnLogin,
  logoutOrEjectionObserver
} from './middlewares';

let storeFlushCallback = () => {
  logger.info({
    logCode: 'store_flushed',
  }, 'Store flushed');
};

const appReducer = combineReducers({
  // meteor collections
  meetingCollection: meetingReducer,
  usersCollection: usersReducer,
  voiceUsersCollection: voiceUsersReducer,
  voiceCallStatesCollection: voiceCallStatesReducer,
  pollsCollection: pollsReducer,
  padsCollection: padsReducer,
  presentationsCollection: presentationsReducer,
  slidesCollection: slidesReducer,
  currentPollCollection: currentPollReducer,
  currentUserCollection: currentUserReducer,
  externalVideoMeetingsCollection: externalVideoMeetingsReducer,
  groupChatCollection: groupChatReducer,
  groupChatMsgCollection: groupChatMsgReducer,
  videoStreamsCollection: videoStreamsReducer,
  screenshareCollection: screenshareReducer,
  guestUsersCollection: guestUsersReducer,
  breakoutsCollection: breakoutsReducer,
  recordMeetingsCollection: recordMeetingsReducer,
  usersSettingsCollection: usersSettingsReducer,
  uploadedFileCollection: uploadedFileReducer,
  padsSessionsCollection: padsSessionsReducer,
  // ...other collections

  // app exclusive wide state collections
  previousPollPublishedCollection: previousPollPublishedReducer,
  audio: audioReducer,
  video: videoReducer,
  screenshare: localScreenshareReducer,
  chat: chatReducer,
  notificationBar: notificationBarReducer,
  modal: modalReducer,
  layout: layoutReducer,
  debug: debugReducer,
  client: clientReducer,
});

const flushStoreObserver = createListenerMiddleware();
const flushStoreEffect = (action, listenerApi) => {
  const state = listenerApi.getState();
  const hasEnded = (_state, type, payload) => {
    if (!_state) return false;

    const disconnected = !_state.client.sessionState.connected || (type === 'client/setConnected' && !payload);
    const ended = _state.client.sessionState.ended || (type === 'client/sessionStateChanged' && payload.ended);
    const terminated = _state.client.sessionState.terminated || (type === 'client/setSessionTerminated' && payload);

    logger.info({
      logCode: 'store_flushed',
    }, `Disconnected=${disconnected}, Ended=${ended}, Terminated=${terminated}`);

    return disconnected && ended && terminated;
  };

  if (hasEnded(state, action.type, action.payload)) {
    logger.info({
      logCode: 'dispatch_store_flushed',
    }, 'Dispatching store_flush');
    if (typeof storeFlushCallback === 'function') storeFlushCallback();
    listenerApi.dispatch({ type: 'STORE_FLUSH' });
  }
};
flushStoreObserver.startListening({
  matcher: isAnyOf(setConnected, setSessionTerminated, sessionStateChanged),
  effect: flushStoreEffect,
});

const rootReducer = (state, action) => {
  ReduxDebug.addToReduxLog(action);
  // Reset the store on logouts
  if (action.type === 'STORE_FLUSH') {
    logger.info({
      logCode: 'flushing_store',
    }, 'Flushing store');

    return appReducer(undefined, action);
  }

  return appReducer(state, action);
};

export const injectStoreFlushCallback = (callback) => {
  storeFlushCallback = callback;
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().prepend([
      flushStoreObserver.middleware,
      videoStreamCleanupObserver.middleware,
      screenshareCleanupObserver.middleware,
      voiceUserStateObserver.middleware,
      voiceCallStateObserver.middleware,
      joinAudioOnLogin.middleware,
      logoutOrEjectionObserver.middleware,
    ]);
  },
});
