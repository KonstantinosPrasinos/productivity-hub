import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  selectedGroup: null,
  screenIsMobile: null,
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
    }
  },
})

// Action creators are generated for each case reducer function
export const {setSelectedGroup, setScreenIsMobile} = uiSlice.actions

export default uiSlice.reducer