const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    user_id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    priority: {
        type: Number,
        required: true
    },
    repeatEvery: {
        subMeasurement: String,
        measurement: String,
        time: {
            from: String,
            to: String
        }
    },
    longGoal: {
        goalType: String,
        number: Number
    },
    goal: {
        type: String,
        required: true
    },
    expiresAt: {
        type: String
    },
    parentCategory: {
        type: String
    }
})

module.exports = mongoose.model("Group", groupSchema);