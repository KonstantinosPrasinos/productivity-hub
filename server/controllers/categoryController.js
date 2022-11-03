const Category = require('../models/categorySchema');

const getCategories = (req, res) => {
    if (req.user) {
        const userId = req.user._id;

        Category.find({'userId': userId}, (err, categories) => {
            if (categories) {return res.status(200).json(categories)}

            return res.status(404).json({message: 'Categories not found.'});
        })
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

module.exports = {getCategories};