const mongoose = require('mongoose');

const User = new mongoose.Schema({
    local: {
        email: {
            type: String, unique: true, required: true
        }, password: {
            type: String, required: true
        }, username: {
            type: String, required: false
        }
    }, google: {
        googleId: {type: String, required: false}
    }, createdAt: {
        type: Date, default: new Date()
    }, active: {
        type: Boolean, default: false
    }
}, {timestamps: true});

User.index({createdAt: 1}, {expireAfterSeconds: 30 * 60, partialFilterExpression: {active: false}});

module.exports = mongoose.model('User', User);