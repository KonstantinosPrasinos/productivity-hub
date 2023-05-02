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
    },
    forDeletion: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})

Entry.index({createdAt: 1}, {expireAfterSeconds: 24 * 60 * 60, partialFilterExpression: {value: 0}});
Entry.index({updatedAt: 1}, {expireAfterSeconds: 60, partialFilterExpression: {forDeletion: true}});

module.exports = mongoose.model('Entry', Entry);