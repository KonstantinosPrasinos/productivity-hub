const mongoose = require('mongoose');

const Task = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    step: Number,
    goal: {
        goalType: Number,
        number: Number
    },
    category: Number,
    priority: {
        type: Number,
        required: true
    },
    longGoal: {
        goalType: String,
        number: Number
    },
    expiresAt: {
        type: String
    },
    timeGroup: String,
    repeatRate: {
        number: {
            type: Number
        },
        bitTimePeriod: String,
        smallTimePeriod: String,
        startingDate: Date,
        time: {
            startingTime: Number,
            endingTime: Number
        }
    }
})

module.exports = mongoose.model('Task', Task)