import { configureStore } from '@reduxjs/toolkit';
import usersReducer from './slices/users';
import meetingReducer from './slices/meeting';
import voiceUsersReducer from './slices/voice-users';
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

export const store = configureStore({
  reducer: {
    meetingCollection: meetingReducer,
    usersCollection: usersReducer,
    voiceUsersCollection: voiceUsersReducer,
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
  },
});
