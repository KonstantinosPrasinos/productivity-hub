import { configureStore } from '@reduxjs/toolkit'
import contentReducer from './contentSlice'
import uiReducer from './uiSlice'

export const store = configureStore({
  reducer: {
      content: contentReducer,
      ui: uiReducer
  },
})