import {createSlice} from '@reduxjs/toolkit'

export const tasksSlice = createSlice({
    name: 'tasks',
    initialState: {tasks: false},
    reducers: {
        addTask: (state, action) => {
            state.tasks.push(action.payload);
        },
        removeTask: (state, action) => {
            const temp = state.tasks.filter(task => task._id !== action.payload);
            return {tasks: temp}
        },
        setTasks: (state, action) => {
            state.tasks = action.payload;
        },
        setTask: (state, action) => {
            const index = state.tasks.findIndex(task => task._id === action.payload.id);
            state.tasks[index] = action.payload;
        },
        setTaskPreviousEntry: (state, action) => {
            state.tasks.find(task => task._id === action.payload.id).previousEntry = action.payload.value;
        },
        setTaskCategory: (state, action) => {
            state.tasks.find(task => task._id === action.payload.id).category = action.payload.value;
        }
    },
})

export const {addTask, removeTask, setTaskPreviousEntry, setTasks, setTask, setTaskCategory} = tasksSlice.actions;

export default tasksSlice.reducer;