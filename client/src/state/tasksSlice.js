import {createSlice} from '@reduxjs/toolkit'

const initialState = {
    tasks: [
        {
            id: '0',
            name: 'Push-Ups',
            type: 'number',
            step: 6,
            goal: {goalType: 'at least', number: 12, unit: 'reps'},
            category: 'Workout',
            priority: 1,
            repeats: 'true',
            longGoal: {goalType: 'streak', number: '60'},
            expiresAt: '20-1-2023',
            timeGroup: 'Monday',
            repeatEvery: null,
            lastEntryDate: '23-9-2022',
            shortHistory: '100111'
        },
        {
            id: '1',
            name: 'Pull-Ups',
            type: 'number',
            step: 3,
            goal: {goalType: 'at least', number: 9, unit: 'reps'},
            category: 'Workout',
            priority: 2,
            repeats: 'true',
            longGoal: {goalType: 'streak', number: '12'},
            expiresAt: '20-1-2023',
            timeGroup: '0',
            repeatEvery: null,
            lastEntryDate: '23-9-2022',
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
        removeTask: (state) => {
            state.groups.pop();
        }
    },
})

export const {addGroup, removeGroup} = tasksSlice.actions;

export default tasksSlice.reducer;