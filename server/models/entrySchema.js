const mongoose = require('mongoose');

const Entry = new mongoose.Schema({
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
        default: 0,
        required: true
    },
    date: {
        type: Date,
        default: new Date(),
        required: true
    }
}, {timestamps: true})

Entry.index({createdAt: 1}, {expireAfterSeconds: 24 * 60 * 60, partialFilterExpression: {value: 0}});

module.exports = mongoose.model('Entry', Entry);