import {createSlice, current} from '@reduxjs/toolkit'

const initialState = {
    userName: null,
    settings: {
        theme: 'light',
        defaults: {
            defaultStep: 5,
            defaultGoal: 10,
            defaultPriority: 1
        }
    }
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setTheme: (state, action) => {
            state.settings.theme = ['light', 'dark', 'black'].includes(action.payload) ? action.payload : state.settings.theme;
        },
        setDefaultStep: (state, action) => {
            state.settings.defaults.defaultStep = !isNaN(parseFloat(action.payload)) ? parseFloat(action.payload) : state.settings.defaults.defaultStep;
        },
        setDefaultGoal: (state, action) => {
            state.settings.defaults.defaultGoal = !isNaN(parseFloat(action.payload)) ? parseFloat(action.payload) : state.settings.defaults.defaultGoal;
        },
        setDefaultPriority: (state, action) => {
            state.settings.defaults.defaultPriority = !isNaN(parseFloat(action.payload)) ? parseFloat(action.payload) : state.settings.defaults.defaultPriority;
        },
    },
})

export const {setTheme, setDefaultGoal, setDefaultPriority, setDefaultStep} = userSlice.actions;

export default userSlice.reducer;