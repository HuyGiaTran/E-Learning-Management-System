import { configureStore } from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';
import authReducer from './slices/authSlice';
import usersReducer from './slices/usersSlice';
import coursesReducer from './slices/coursesSlice';
import studentDashboardReducer from './slices/studentDashboardSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    users: usersReducer,
    courses: coursesReducer,
    studentDashboard: studentDashboardReducer,
  },
});
