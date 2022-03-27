import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  groups: ['Workout', 'Reading', 'Random Thing', 'Example'],
}

export const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    addGroup: (state, action) => {
      state.groups.push(action.payload);
    },
    removeGroup: (state) => {
      state.groups.pop();
    }
  },
})

// Action creators are generated for each case reducer function
export const {addGroup, removeGroup} = contentSlice.actions

export default contentSlice.reducer