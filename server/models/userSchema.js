const mongoose = require('mongoose');

const User = new mongoose.Schema({
    email: String,
    password: {
        type: String
    }
});

module.exports = mongoose.model('User', User);