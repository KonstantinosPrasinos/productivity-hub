import {createSlice} from "@reduxjs/toolkit";

export const groupsSlice = createSlice({
    name: 'groups',
    initialState: {
        groups: [{
            id: '0',
            name: 'Monday',
            priority: 1,
            repeatEvery: {
                subMeasurement: 'Monday',
                measurement: 'week',
                time: {
                    from: '17:00',
                    to: '21:00'
                }
            },
            longGoal: {
                goalType: 'streak',
                number: '12'
            },
            goal: {
                goalType: 'any task',
                number: null
            },
            expiresAt: '20-1-2023',
            parentCategory: '0'
        }]
    },
    reducers: {
        addGroup: (state, action) => {
            state.groups.push(action.payload);
        },
        removeGroup: (state, action) => {
            state.groups.filter(group => group.id !== action.payload)
        },
        setGroups: (state, action) => {
            state.groups.length = 0;
            state.groups.push(...action.payload);
        },
        emptyGroups: (state) => {
            state.groups.length = 0;
        }
    }
})

export const {addGroup, removeGroup, setGroups, emptyGroups} = groupsSlice.actions;

export default groupsSlice.reducer;