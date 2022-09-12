import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  selectedGroup: null,
  screenIsMobile: null,
  isDarkMode: false,
  uiTheme: 'light',
  shownPopup: 'none',
  user: null,
  dataHasBeenLoaded: true
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
    },
    setShownPopup: (state, action) => {
      state.shownPopup = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setDataHasBeenLoaded: (state, action) => {
      state.dataHasBeenLoaded = action.payload;
    },
    setUiTheme: (state, action) => {
      state.uiTheme = action.payload;
    }
  },
})

// Action creators are generated for each case reducer function
export const {setSelectedGroup, setScreenIsMobile, setIsDarkMode, setShownPopup, setUser, setDataHasBeenLoaded, setUiTheme} = uiSlice.actions

export default uiSlice.reducer