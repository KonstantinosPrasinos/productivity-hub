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
    type: {
        type: String,
        required: true
    },
    step: Number,
    goal: {
        type: String,
        number: Number
    },
    category: Number,
    priority: {
        type: Number,
        required: true
    },
    repeats: {
        type: Boolean,
        required: true
    },
    longGoal: {
        type: {type: String},
        number: Number
    },
    expiresAt: {
        type: String,
        timePeriod: String
    },
    timeGroup: String,
    repeatRate: {
        number: Number,
        bigTimePeriod: String,
        smallTimePeriod: [String],
        startingDate: [Number],
        time: {
            starting: Number,
            ending: Number
        }
    },
    previousEntries: {
        value: {type: String},
        latest: {type: Number},
        mostRecent: {type: Number}
    }
}, {timestamps: true})

module.exports = mongoose.model('Task', Task)