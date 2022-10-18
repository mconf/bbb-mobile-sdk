import { configureStore } from '@reduxjs/toolkit';
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
import videoStreamsReducer, { videoStreamCleanupMW } from './slices/video-streams';
import screenshareReducer, { screenshareCleanupMW } from './slices/screenshare';
// app exclusive wide state collections
import previousPollPublishedReducer from './slices/wide-app/previous-poll-published';
import audioReducer from './slices/wide-app/audio';
import videoReducer from './slices/wide-app/video';
import localScreenshareReducer from './slices/wide-app/screenshare';
import chatReducer from './slices/wide-app/chat';
import interactionsReducer from './slices/wide-app/interactions';
// Middlewares
import {
  voiceUserStateObserver,
} from './middlewares';

export const store = configureStore({
  reducer: {
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
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().prepend([
      videoStreamCleanupMW.middleware,
      screenshareCleanupMW.middleware,
      voiceUserStateObserver.middleware,
    ]);
  },
});
