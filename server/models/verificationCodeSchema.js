const mongoose = require('mongoose');

const VerificationCode = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    expireAt: {
        type: Date,
        default: new Date(),
        expires: 1800
    }
})

module.exports = mongoose.model('VerificationCode', VerificationCode);