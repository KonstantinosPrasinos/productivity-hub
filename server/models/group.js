const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = new Schema({
    user_id: {
        type: String,
        required: true
    },
    id: {
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
    number: {
        type: Number,
        required: true
    },
    bigTimePeriod: {
        type: String,
        required: true
    },
    smallTimePeriod: {
        type: String
    },
    parent: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("Group", groupSchema);