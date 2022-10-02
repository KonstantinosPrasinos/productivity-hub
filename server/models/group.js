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
    name: {
        type: String,
        required: true
    },
    repeatNumber: {
        type: Number,
        required: true
    },
    timePeriod: {
        type: String,
        required: true
    },
    onTimePeriod: {
        type: [String]
    }
})

module.exports = mongoose.model("Group", groupSchema);