const Category = require('../models/categorySchema');
const Task = require('../models/taskSchema');
const Joi = require('joi');
const Group = require('../models/groupSchema');
const {deleteGroupTasks} = require("../functions/deleteGroupTasks");

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
        // The user has 3 choices.
        // They can either delete all the tasks which are children of groups of this category
        // Or keep them
        let {categoryId, deleteTasks} = req.body;

        if (!categoryId) return res.status(400).json({message: "You have to provide a categoryId."})
        if (deleteTasks === undefined || deleteTasks === null) deleteTasks = false;

        // Delete category
        try{
            await Category.deleteOne({usrId: req.user._id, _id: categoryId});
            const deleteResponse = await Group.deleteMany({userId: req.user._id, parent: categoryId});

            if (deleteResponse?.deletedCount > 0) {
                if (deleteTasks) {
                    await deleteGroupTasks(req.user._id, categoryId)
                } else {
                    await Task.updateMany({userId: req.user._id, category: categoryId}, {$set: {group: null, category: null}});
                }
            }
        } catch (error) {
            return res.status(400).json({message: error})
        }

        return res.status(200).json({categoryId});
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

module.exports = {getCategories, createCategory, deleteCategory};