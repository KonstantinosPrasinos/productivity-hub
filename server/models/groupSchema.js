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
        startingDate: [Number],
        time: {
            start: String,
            end: String
        }
    },
    parent: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Group', Group);