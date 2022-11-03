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
        smallTimePeriod: String,
        startingDate: Date,
        time: {
            startingTime: Number,
            endingTime: Number
        }
    },
    parent: String
})

module.exports = mongoose.model('Group', Group);