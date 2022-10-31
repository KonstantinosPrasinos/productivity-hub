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
    }
});

module.exports = mongoose.model('User', User);