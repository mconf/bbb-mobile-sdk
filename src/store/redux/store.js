import { configureStore } from '@reduxjs/toolkit';
import usersReducer from './users';
import meetingReducer from './meeting';
import voiceUsersReducer from './voice-users';
import pollsReducer from './polls';
import padsReducer from './pads';
import currentPollReducer from './current-poll';
import currentUserReducer from './current-user';
import presentationsReducer from './presentations';
import externalVideoMeetingsReducer from './external-video-meetings';

export const store = configureStore({
  reducer: {
    meetingCollection: meetingReducer,
    usersCollection: usersReducer,
    voiceUsersCollection: voiceUsersReducer,
    pollsCollection: pollsReducer,
    padsCollection: padsReducer,
    presentationsCollection: presentationsReducer,
    currentPollCollection: currentPollReducer,
    currentUserCollection: currentUserReducer,
    externalVideoMeetingsCollection: externalVideoMeetingsReducer,
    // ...other collections
  },
});
