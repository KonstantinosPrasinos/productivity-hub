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
    description: {
        type: String,
        maxLength: 120
    },
    type: {
        type: String,
        required: true
    },
    step: Number,
    goal: {
        limit: {
            type: String
        },
        number: Number
    },
    category: String,
    priority: {
        type: Number,
        required: true
    },
    repeats: {
        type: Boolean,
        required: true
    },
    longGoal: {
        limit: {type: String},
        type: {type: String},
        number: Number
    },
    expiresAt: {
        type: String,
        timePeriod: String
    },
    group: String,
    repeatRate: {
        number: Number,
        bigTimePeriod: String,
        smallTimePeriod: [String],
        startingDate: [Date],
        time: {
            start: String,
            end: String
        }
    },
    mostRecentProperDate: {
        type: Date,
        default: null
    },
    forDeletion: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})

Task.index({updatedAt: 1}, {expireAfterSeconds: 60, partialFilterExpression: {forDeletion: true}});

module.exports = mongoose.model('Task', Task)