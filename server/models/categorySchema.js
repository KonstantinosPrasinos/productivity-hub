const mongoose = require('mongoose');

const Category = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Category', Category);