const mongoose = require('mongoose');

const User = new mongoose.Schema({
    local: {
        email: {
            type: String, unique: true, required: true
        }, password: {
            type: String, unique: true, required: true
        },
        username: {
            type: String, required: false
        }
    },
    google: {
        googleId: {type: String, required: false}
    },
    settings: {
        theme: {
            type: String,
            default: 'Light'
        },
        defaults: {
            step: {type: Number, default: 1},
            goal: {type: Number, default: 1},
            priority: {type: Number, default: 1}
        }
    }
});

module.exports = mongoose.model('User', User);