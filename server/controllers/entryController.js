const Entry = require('../models/entrySchema');
const Joi = require('joi');

const taskHistorySchema = Joi.object({
    taskId: Joi.string().required(),
    value: Joi.string().required()
})

const getRecentEntries = async (req, res) => {
    if (req.user) {
        const {taskId} = req.body;

        const entries = await Entry.find({"$and": [{userId: req.user._id}, {taskId: taskId}]}).sort({ $natural: -1 }).limit(7);

        res.status(200).json({entries});
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

const getTaskEntries = (req, res) => {
    if (req.user) {
        const {taskId} = req.body;

        Entry.find({"$and": [{userId: req.user._id}, {taskId: taskId}]}, (err, entries) => {
            if (entries) {return res.status(200).json({entries})}

            return res.status(404).json({message: 'Past entries not found.'});
        });
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

const getTaskEntryById = (req, res) => {
    if (req.user) {
        const {entryId} = req.params;

        Entry.findOne({"$and": [{userId: req.user._id}, {_id: entryId}]}, (err, entry) => {
            if (err) return res.status(400).json({message: err.message});
            return res.status(200).json({entry});
        });
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

const addEntryFunc = async (entry, userId) => {
    const validatedEntry = taskHistorySchema.validate(entry);

    try {
        // Validate task exists
        return await Entry.create({...validatedEntry.value, userId: userId});
    } catch (error) {
        return {error};
    }
}

const addTaskEntry = async (req, res) => {
    if (req.user) {
        const {entry} = req.body;

        const {error} = addEntryFunc(entry, req.user._id)

        if (error) {
            return res.status(500).json({message: error.message});
        }

        return res.status(200).json({message: 'Entry added successfully.'});
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

const setEntryValue = (req, res) => {
    if (req.user) {
        const {taskId, entryId, value} = req.body;

        if (isNaN(value) || !taskId || !entryId) return res.status(400).json({message: 'Ping!'})

        Entry.findOneAndUpdate({_id: entryId}, {$set: {value: value}}, (err, entry) => {
            if (err) return res.status(400).json({message: 'Failed to set entry value.'});
            return res.status(200).json({entry})
        });
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

const deleteEntry = (req, res) => {
    if (req.user) {
        const {id} = req.body;

        Entry.findByIdAndDelete(id, (err) => {
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

        Entry.deleteMany({"$and": [{userId: req.user._id}, {taskId: taskId}]});
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

module.exports = {getRecentEntries, getTaskEntries, addTaskEntry, setEntryValue, deleteEntry, deleteTaskEntries, getTaskEntryById};