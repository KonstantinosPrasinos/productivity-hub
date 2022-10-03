const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    user_id: {
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
    },
    timeGroups: [{type: String}]
}, {collection: 'Categories'});

const Category = mongoose.model('Category', categorySchema);
module.export = Category;