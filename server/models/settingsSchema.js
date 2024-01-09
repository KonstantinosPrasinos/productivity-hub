const mongoose = require('mongoose');

const Settings = new mongoose.Schema({
    userId: {
        type: String,
        unique: true,
        required: true
    },
    theme: {
        type: String,
        default: 'Light'
    },
    confirmDelete: {
        type: Boolean,
        default: true
    },
    defaults: {
        step: {type: Number, default: 1},
        goal: {type: Number, default: 1},
        priority: {type: Number, default: 1},
        deleteGroupAction: {type: String, default: "Keep their repeat details"}
    }
});

module.exports = mongoose.model('Settings', Settings);