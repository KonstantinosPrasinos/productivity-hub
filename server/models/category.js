const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    id: {
        type: String,
        required: true
    },
    user_id: {
        type: String,
        required: true
    },
    name: {
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