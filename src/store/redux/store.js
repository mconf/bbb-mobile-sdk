import { combineReducers, configureStore } from '@reduxjs/toolkit';
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
// app exclusive wide state collections
import previousPollPublishedReducer from './slices/wide-app/previous-poll-published';
import audioReducer from './slices/wide-app/audio';
import videoReducer from './slices/wide-app/video';
import localScreenshareReducer from './slices/wide-app/screenshare';
import chatReducer from './slices/wide-app/chat';
import interactionsReducer from './slices/wide-app/interactions';
import layoutReducer from './slices/wide-app/layout';
import clientReducer from './slices/wide-app/client';
// Middlewares
import {
  screenshareCleanupObserver,
  videoStreamCleanupObserver,
  voiceUserStateObserver,
  voiceCallStateObserver,
} from './middlewares';

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
  // ...other collections

  // app exclusive wide state collections
  previousPollPublishedCollection: previousPollPublishedReducer,
  audio: audioReducer,
  video: videoReducer,
  screenshare: localScreenshareReducer,
  chat: chatReducer,
  interactions: interactionsReducer,
  layout: layoutReducer,
  client: clientReducer,
});

const rootReducer = (state, action) => {
  // Reset the store on logouts
  if (action.type === 'client/setLoggedIn' && action.payload === false) {
    return appReducer(undefined, action);
  }

  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().prepend([
      videoStreamCleanupObserver.middleware,
      screenshareCleanupObserver.middleware,
      voiceUserStateObserver.middleware,
      voiceCallStateObserver.middleware,
    ]);
  },
});
