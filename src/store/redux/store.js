import { configureStore } from '@reduxjs/toolkit';
import usersReducer from './users';
import meetingReducer from './meeting';
import voiceUsersReducer from './voice-users';
import pollsReducer from './polls';

export const store = configureStore({
  reducer: {
    meetingCollection: meetingReducer,
    usersCollection: usersReducer,
    voiceUsersCollection: voiceUsersReducer,
    pollsCollection: pollsReducer,
    // ...other collections
  },
});
