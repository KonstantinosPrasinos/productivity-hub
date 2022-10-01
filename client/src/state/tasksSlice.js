import {createSlice} from '@reduxjs/toolkit'

const initialState = {
    tasks: [
        {
            id: '0',
            name: 'Push-Ups',
            type: 'number',
            step: 6,
            goal: {goalType: 'at least', number: 12},
            category: '0',
            priority: 1,
            repeats: 'true',
            longGoal: {goalType: 'streak', number: '60'},
            expiresAt: '20-1-2023',
            timeGroup: '0',
            repeatEvery: null,
            lastEntryDate: '23-9-2022',
            previousEntry: '8',
            shortHistory: '100111'
        },
        {
            id: '2',
            name: 'Study french vocabulary',
            type: 'number',
            step: 6,
            goal: {goalType: 'at least', number: 12, unit: 'reps'},
            category: null,
            priority: 3,
            repeats: 'true',
            longGoal: {goalType: 'streak', number: '60'},
            expiresAt: '20-1-2023',
            timeGroup: null,
            repeatEvery: null,
            lastEntryDate: '23-9-2022',
            previousEntry: '6',
            shortHistory: '111111'
        },
        {
            id: '1',
            name: 'Pull-Ups',
            type: 'number',
            step: 3,
            goal: {goalType: 'at least', number: 9, unit: 'reps'},
            category: '0',
            priority: 2,
            repeats: 'true',
            longGoal: {goalType: 'streak', number: '12'},
            expiresAt: '20-1-2023',
            timeGroup: '0',
            repeatEvery: null,
            lastEntryDate: '23-9-2022',
            previousEntry: '3',
            shortHistory: '011010'
        }
    ]
}

export const tasksSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        addTask: (state, action) => {
            state.tasks.push(action.payload);
        },
        removeTask: (state, action) => {
            state.tasks.filter(task => task.id !== action.payload)
        },
        setTasks: (state, action) => {
            state.tasks = action.payload;
        },
        setTaskPreviousEntry: (state, action) => {
            state.tasks.find(task => task.id === action.payload.id).previousEntry = action.payload.value;
        }
    },
})

export const {addTask, removeTask, setTaskPreviousEntry, setTasks} = tasksSlice.actions;

export default tasksSlice.reducer;