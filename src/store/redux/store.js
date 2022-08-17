import { configureStore } from '@reduxjs/toolkit';
import usersReducer from './users';
import meetingReducer from './meeting';
import voiceUsersReducer from './voice-users';

export const store = configureStore({
  reducer: {
    meetingCollection: meetingReducer,
    usersCollection: usersReducer,
    voiceUsersCollection: voiceUsersReducer,
    // ...other collections
  },
});
