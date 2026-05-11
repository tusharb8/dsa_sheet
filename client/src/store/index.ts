import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import topicsReducer from './topicsSlice';
import progressReducer from './progressSlice';
import usersReducer from './usersSlice';
import rolesReducer from './rolesSlice';
import rightsReducer from './rightsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    topics: topicsReducer,
    progress: progressReducer,
    users: usersReducer,
    roles: rolesReducer,
    rights: rightsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
