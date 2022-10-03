import {createSlice} from "@reduxjs/toolkit";

export const groupsSlice = createSlice({
    name: 'groups',
    initialState: {
        groups: []
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