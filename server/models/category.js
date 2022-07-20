const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    until: {
        type: String,
    },
    goal: {
        type: Number,
    },
    priority: {
        type: Number
    },
    home: {
        type: Boolean
    },
    color: {
        type: String
    },
    Groups: []
}, {collection: 'Categories'});

const Category = mongoose.model('Category', categorySchema);
module.export = Category;