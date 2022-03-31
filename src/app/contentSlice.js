import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  groups: [{name: 'Workout', id: 1, recentValues: '111101'}, {name: 'Reading', id: 2, recentValues: '011001'}, {name: 'French', id: 3, recentValues: '101001'}],
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

export const {addGroup, removeGroup} = contentSlice.actions

export default contentSlice.reducer