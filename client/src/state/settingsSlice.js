import {createSlice} from "@reduxjs/toolkit";

export const settingsSlice = createSlice({
    name: 'settings',
    initialState: {},
    reducers: {
        setSettings: (state, action) => {
            return action.payload;
        },
        removeSettings: () => {
            return null;
        },
        setTheme: (state, action) => {
            state.theme = ['Light', 'Dark', 'Black', 'Device'].includes(action.payload) ? action.payload : state.settings.theme;
        },
        setDefaultStep: (state, action) => {
            state.defaults.step = !isNaN(parseFloat(action.payload)) ? parseFloat(action.payload) : state.settings.defaults.step;
        },
        setDefaultGoal: (state, action) => {
            state.defaults.goal = !isNaN(parseFloat(action.payload)) ? parseFloat(action.payload) : state.settings.defaults.goal;
        },
        setDefaultPriority: (state, action) => {
            state.defaults.priority = !isNaN(parseFloat(action.payload)) ? parseFloat(action.payload) : state.settings.defaults.priority;
        },
        setLowestPriority: (state, action) => {
            state.priorityBounds.low = action.payload;
        },
        setHighestPriority: (state, action) => {
            state.priorityBounds.high = action.payload;
        }
    }
})

export const {setTheme, setDefaultGoal, setDefaultPriority, setDefaultStep, setLowestPriority, setHighestPriority, setSettings, removeSettings} = settingsSlice.actions;

export default settingsSlice.reducer;