const mongoose = require('mongoose');

const Category = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    priority: {
        type: Number
    },
    repeatRate: {
        number: Number,
        bigTimePeriod: String,
        startingDate: [Date],
    },
    goal: {
        limit: {type: String},
        type: {type: String},
        number: Number
    }
}, {timestamps: true})

module.exports = mongoose.model('Category', Category);