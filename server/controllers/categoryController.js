const Category = require('../models/categorySchema');
const Task = require('../models/taskSchema');
const Joi = require('joi');
const Group = require('../models/groupSchema');
const {deleteGroupTasks} = require("../functions/deleteGroupTasks");
const {groupSchema} = require('./groupController');

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
        const {category, groups}  = req.body;

        if (!category) return res.status(400).json({message: "No category provided."});

        const validatedCategory = categorySchema.validate(category);

        if (validatedCategory.error) {
            return res.status(400).json({message: validatedCategory.error});
        }

        let validatedGroups = [];

        if (groups.length) {
            for (const group of groups) {
                const validatedGroup = groupSchema.validate(group);

                if (validatedGroup.error) return res.status(400).json({message: validatedGroup.error});

                validatedGroup.value.userId = req.user._id;

                validatedGroups.push(validatedGroup.value);
            }
        }

        try {
            const newCategory = await Category.create({
                ...validatedCategory.value,
                userId: req.user._id
            });

            let newGroups = undefined;

            if (validatedGroups.length) {
                newGroups = await Group.create(validatedGroups.map(group => {
                    return {...group, parent: newCategory._id}
                }));
            }

            res.status(200).json({newCategory, newGroups});
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
            await Category.deleteOne({userId: req.user._id, _id: categoryId});
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

const setCategory = async (req, res) => {
    if (req.user) {
        const {category, groups}  = req.body;

        if (!category) return res.status(400).json({message: "No category provided."});

        const validatedCategory = categorySchema.validate(category);

        if (validatedCategory.error) {
            return res.status(400).json({message: validatedCategory.error});
        }

        let validatedGroups = [];

        if (groups.length) {
            for (const group of groups) {
                const validatedGroup = groupSchema.validate(group);

                if (validatedGroup.error) return res.status(400).json({message: validatedGroup.error});

                validatedGroup.value.userId = req.user._id;

                validatedGroups.push(validatedGroup.value);
            }
        }

        try {
            const newCategory = await Category.findOneAndReplace({userId: req.user._id, _id: validatedCategory.value._id}, {
                ...validatedCategory.value,
                userId: req.user._id
            }, {new: true});

            let newGroups = [];

            if (validatedGroups.length) {
                for (const group of validatedGroups) {
                    newGroups.push(await Group.findOneAndReplace({userId: req.user._id, _id: group._id, parent: group.parent}, {...group, parent: newCategory._id}))
                }
            }

            res.status(200).json({newCategory, newGroups});
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

module.exports = {getCategories, createCategory, deleteCategory, setCategory};