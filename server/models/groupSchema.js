const mongoose = require('mongoose');

const Group = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    priority: {
        type: Number,
        required: true
    },
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
    goal: {
        limit: {type: String},
        type: {type: String},
        number: Number
    },
    parent: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Group', Group);