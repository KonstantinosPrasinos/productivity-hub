import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  selectedGroup: null,
  screenIsMobile: null,
  isDarkMode: false
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSelectedGroup: (state, action) => {
      state.selectedItem = action.payload;
    },
    setScreenIsMobile: (state, action) => {
      state.screenIsMobile = action.payload;
    },
    setIsDarkMode: (state, action) => {
      state.isDarkMode = action.payload;
    }
  },
})

// Action creators are generated for each case reducer function
export const {setSelectedGroup, setScreenIsMobile, setIsDarkMode} = uiSlice.actions

export default uiSlice.reducer