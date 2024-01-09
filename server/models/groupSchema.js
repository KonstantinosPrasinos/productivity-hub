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
    repeatRate: {
        smallTimePeriod: [String],
        startingDate: [Date],
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