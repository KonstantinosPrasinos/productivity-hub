const TaskHistory = require('../models/taskHistorySchema');
const Joi = require('joi');

const taskHistorySchema = Joi.object({
    taskId: Joi.string().required(),
    value: Joi.string().required()
})

const getRecentEntries = async (req, res) => {
    if (req.user) {
        const {taskId} = req.body;

        const entries = await TaskHistory.find({"$and": [{userId: req.user._id}, {taskId: taskId}]}).sort({ $natural: -1 }).limit(7);

        res.status(200).json({entries});
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

const getTaskEntries = (req, res) => {
    if (req.user) {
        const {taskId} = req.body;

        TaskHistory.find({"$and": [{userId: req.user._id}, {taskId: taskId}]}, (err, entries) => {
            if (entries) {return res.status(200).json({entries})}

            return res.status(404).json({message: 'Past entries not found.'});
        });
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

const addTaskEntry = async (req, res) => {
    if (req.user) {
        const {entry} = req.body;

        const validatedEntry = taskHistorySchema.validate(entry);

        try {
            await TaskHistory.create({...validatedEntry.value, userId: req.user._id});
            res.status(200).json({message: 'Entry added successfully.'});
        } catch (error) {
            res.status(500).json({message: error.message});
        }
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

const setEntryValue = (req, res) => {
    if (req.user) {
        const {id, value} = req.body;

        TaskHistory.findByIdAndUpdate(id, {$set: {value: value}}, (err, entry) => {
            if (entry) {return res.status(200)}

            return res.status(404).json({message: 'Failed to set entry value.'});
        });
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

const deleteEntry = (req, res) => {
    if (req.user) {
        const {id} = req.body;

        TaskHistory.findByIdAndDelete(id, (err) => {
            if (err) res.status(500).json({message: "Failed to delete entry."});

            res.status(200);
        });
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

const deleteTaskEntries = async (req, res) => {
    if (req.user) {
        const {taskId} = req.body;

        TaskHistory.deleteMany({"$and": [{userId: req.user._id}, {taskId: taskId}]});
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

module.exports = {getRecentEntries, getTaskEntries, addTaskEntry, setEntryValue, deleteEntry, deleteTaskEntries};