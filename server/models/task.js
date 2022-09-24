const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
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
    type: {
        type: String,
        required: true
    },
    step: Number,
    goal: {goalType: String, number: Number, unit: String},
    category: {
        type: String
    },
    priority: {
        type: Number,
        required: true
    },
    repeats: {
        type: Boolean,
        required: true
    },
    longGoal: {goalType: String, number: Number},
    expiresAt: {
        type: String
    },
    timeGroup: {
        type: String
    },
    repeatEvery: {
        subMeasurement: String,
        measurement: String,
        time: {
            from: String,
            to: String
        }
    },
    lastEntryDate: Date,
    shortHistory: String
});

module.exports = mongoose.model("Task", taskSchema);