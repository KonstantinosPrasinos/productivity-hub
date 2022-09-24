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
        setGroups: (state, action) => {
            state.groups.length = 0;
            state.groups.push(...action.payload);
        },
        emptyGroups: (state, action) => {
            state.groups.length = 0;
        }
    }
})

export const {setCategories, emptyCategories} = groupsSlice.actions;

export default groupsSlice.reducer;