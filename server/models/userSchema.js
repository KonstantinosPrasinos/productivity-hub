const mongoose = require('mongoose');

const User = new mongoose.Schema({
    local: {
        email: {
            type: String, unique: true, required: true
        }, password: {
            type: String, required: false
        }, username: {
            type: String, required: false
        }
    }, googleId: {
        type: String, unique: true, required: false, sparse: true
    }, createdAt: {
        type: Date, default: new Date()
    }, active: {
        type: Boolean, default: false
    }
}, {timestamps: true});

User.pre('validate', function(next) {
    const that = this;

    if (that.googleId) {
        next();
    }

    if (!that.local.password) {
        next(new Error('No password provided'));
    }

    next();
});

User.index({createdAt: 1}, {expireAfterSeconds: 30 * 60, partialFilterExpression: {active: false}});

module.exports = mongoose.model('User', User);