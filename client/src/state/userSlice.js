import {createSlice} from '@reduxjs/toolkit'

const initialState = {
    userId: 1,
    settings: {
        theme: 'Light',
        defaults: {
            step: 5,
            goal: 10,
            priority: 1
        }
    },
    priorityBounds: {
        low: 1,
        high: 1
    },
    email: 'konstantinos.prasinos@gmail.com'
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setTheme: (state, action) => {
            state.settings.theme = ['Light', 'Dark', 'Black', 'Device'].includes(action.payload) ? action.payload : state.settings.theme;
        },
        setDefaultStep: (state, action) => {
            state.settings.defaults.step = !isNaN(parseFloat(action.payload)) ? parseFloat(action.payload) : state.settings.defaults.step;
        },
        setDefaultGoal: (state, action) => {
            state.settings.defaults.goal = !isNaN(parseFloat(action.payload)) ? parseFloat(action.payload) : state.settings.defaults.goal;
        },
        setDefaultPriority: (state, action) => {
            state.settings.defaults.priority = !isNaN(parseFloat(action.payload)) ? parseFloat(action.payload) : state.settings.defaults.priority;
        },
        setLowestPriority: (state, action) => {
            state.priorityBounds.low = action.payload;
        },
        setHighestPriority: (state, action) => {
            state.priorityBounds.high = action.payload;
        }
    },
})

export const {setTheme, setDefaultGoal, setDefaultPriority, setDefaultStep, setLowestPriority, setHighestPriority} = userSlice.actions;

export default userSlice.reducer;