const Category = require('../models/categorySchema');
const Joi = require('joi');

const categorySchema = Joi.object({
    title: Joi.string().required(),
    color: Joi.string().required()
})

const getCategories = (req, res) => {
    if (req.user) {
        Category.find({userId: req.user._id}, (err, categories) => {
            if (categories) {return res.status(200).json({categories})}

            return res.status(404).json({message: 'Categories not found.'});
        })
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

const createCategory = async (req, res) => {
    if (req.user) {
        const {category}  = req.body;

        const validatedCategory = categorySchema.validate(category);

        if (validatedCategory.error) {
            return res.status(400).json({message: validatedCategory.error});
        }

        try {
            const newCategory = await Category.create({
                ...validatedCategory.value,
                userId: req.user._id
            });
            res.status(200).json(newCategory);
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

const deleteCategory = async (req, res) => {
    if (req.user) {
        const {categoryId} = req.body;
        Category.findByIdAndDelete(categoryId, (err) => {
            if (err) {
                return res.status(500).json({message: err});
            }

            return res.status(200).json({message: 'Category deleted successfully.'})
        })
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

module.exports = {getCategories, createCategory, deleteCategory};