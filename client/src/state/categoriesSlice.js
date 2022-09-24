import {createSlice} from "@reduxjs/toolkit";

export const categoriesSlice = createSlice({
    name: 'categories',
    initialState: {
        categories: [{
            id: '0',
            name: 'Workout',
            color: 'green',
            timeGroups: ['0']
        }]},
    reducers: {
        setCategories: (state, action) => {
            state.categories.length = 0;
            state.categories.push(...action.payload);
        },
        emptyCategories: (state, action) => {
            state.categories.length = 0;
        }
    }
})

export const {setCategories, emptyCategories} = categoriesSlice.actions;

export default categoriesSlice.reducer;