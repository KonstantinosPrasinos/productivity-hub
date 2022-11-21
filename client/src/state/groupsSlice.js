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
            const temp = state.groups.filter(group => group.id !== action.payload);
            return {groups: temp}
        },
        setGroups: (state, action) => {
            state.groups = action.payload;
        },
        setGroup: (state, action) => {
            const index = state.groups.findIndex(group => group.id === action.payload.id);
            state.groups[index] = action.payload;
        },
        emptyGroups: (state) => {
            state.groups.length = 0;
        }
    }
})

export const {addGroup, removeGroup, setGroup, setGroups, emptyGroups} = groupsSlice.actions;

export default groupsSlice.reducer;