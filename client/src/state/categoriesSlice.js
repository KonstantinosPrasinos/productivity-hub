import {createSlice} from "@reduxjs/toolkit";

export const categoriesSlice = createSlice({
    name: 'categories',
    initialState: {
        categories: []},
    reducers: {
        addCategory: (state, action) => {
            state.categories.push(action.payload);
        },
        removeCategory: (state, action) => {
            const temp = state.categories.filter(category => category.name !== action.payload);
            return {tasks: temp}
        },
        setCategories: (state, action) => {
            state.categories.length = 0;
            state.categories.push(...action.payload);
        },
        emptyCategories: (state) => {
            state.categories.length = 0;
        }
    }
})

export const {setCategories, emptyCategories, addCategory, removeCategory} = categoriesSlice.actions;

export default categoriesSlice.reducer;