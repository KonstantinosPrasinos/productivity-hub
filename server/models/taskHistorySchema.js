const mongoose = require('mongoose');

const TaskHistory = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    taskId: {
        type: String,
        required: true
    },
    value: {
        type: Number,
        required: true
    }
}, {timestamps: true})

module.exports = mongoose.model('TaskHistory', TaskHistory);