import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from "./tasksSlice";
import groupsReducer from './groupsSlice';
import categoriesReducer from './categoriesSlice';
import userReducer from './userSlice';

export const store = configureStore({
  reducer: {
      tasks: tasksReducer,
      groups: groupsReducer,
      categories: categoriesReducer,
      user: userReducer
  },
})