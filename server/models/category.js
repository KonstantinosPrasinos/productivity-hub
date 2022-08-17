const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    period: {
        type: String,
        required: true
    }
});

const categorySchema = new Schema({
    title: {
        type: String,
        required: true
    },
    until: {
        type: String,
    },
    entryGoal: {
        type: String,
    },
    longTermGoal: {
        type: String,
    },
    priority: {
        type: Number
    },
    inHome: {
        type: Boolean
    },
    color: {
        type: String
    },
    groups: [groupSchema]
}, {collection: 'Categories'});

const Category = mongoose.model('Category', categorySchema);
module.export = Category;