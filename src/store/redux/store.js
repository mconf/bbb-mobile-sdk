import { configureStore } from '@reduxjs/toolkit';
import usersReducer from './users';

export const store = configureStore({
  reducer: {
    usersCollection: usersReducer,
    // ...other collections
  },
});
