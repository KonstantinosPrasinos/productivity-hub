import {createSlice} from "@reduxjs/toolkit";

export const categoriesSlice = createSlice({
    name: 'categories',
    initialState: {
        categories: []
    },
    reducers: {
        addCategory: (state, action) => {
            state.categories.push(action.payload);
        },
        removeCategory: (state, action) => {
            const temp = state.categories.filter(category => category.id !== action.payload);
            return {categories: temp}
        },
        setCategories: (state, action) => {
            state.categories = action.payload;
        },
        setCategory: (state, action) => {
            const index = state.categories.findIndex(category => category.id === action.payload.id);
            state.categories[index] = action.payload;
        },
        emptyCategories: (state) => {
            state.categories.length = 0;
        }
    }
})

export const {setCategories, emptyCategories, setCategory, addCategory, removeCategory} = categoriesSlice.actions;

export default categoriesSlice.reducer;