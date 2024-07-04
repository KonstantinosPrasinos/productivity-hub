const Entry = require('../models/entrySchema');
const Joi = require("joi");

const entrySchema = Joi.object({
    taskId: Joi.string().required(),
    value: Joi.number().required(),
    data: Joi.date(),
    userId: Joi.string()
})

const checkIfDate = (date) => {
    return (new Date(date) !== "Invalid Date") && isNaN(date)
}

const getRecentEntries = async (req, res) => {
    if (req.user) {
        const {taskId} = req.body;

        const entries = await Entry.find({userId: req.user._id, taskId: taskId}).sort({$natural: -1}).limit(7);

        res.status(200).json({entries});
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

const getTaskEntries = (req, res) => {
    if (req.user) {
        const {taskId} = req.params;

        const startDay = new Date();
        startDay.setHours(0, 0, 0, 0);
        const endDay = new Date();
        endDay.setHours(23, 59, 59, 999);

        Entry.find({
            userId: req.user._id,
            taskId: taskId,
            date: {$not: {$gte: startDay, $lte: endDay}}
        }, (err, entries) => {
            if (entries) {
                return res.status(200).json({entries})
            }

            return res.status(404).json({message: 'Past entries not found.'});
        });
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

const getTaskEntryById = (req, res) => {
    if (req.user) {
        const {entryId} = req.params;

        Entry.findOne({userId: req.user._id, _id: entryId}, (err, entry) => {
            if (err) return res.status(400).json({message: err.message});
            return res.status(200).json({entry});
        });
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

const setEntryValue = (req, res) => {
    if (req.user) {
        const {taskId, entryId, value} = req.body;

        if (isNaN(value) || !taskId || !entryId) return res.status(400).json({message: 'Invalid task id, entry id or value.'})

        Entry.findOneAndUpdate({userId: req.user._id, _id: entryId}, {$set: {value: value}}, (err, entry) => {
            if (err) return res.status(400).json({message: 'Failed to set entry value.'});
            return res.status(200).json({entry})
        });
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

const setEntry = async (req, res) => {
    if (req.user) {
        const {entryId, taskId, value, date} = req.body;

        let changes = {};

        if (!isNaN(value)) {
            changes.value = value;
        }

        if (date && checkIfDate(date)) {
            changes.date = new Date(date);
        }

        try {
            const entry = await Entry.findOneAndUpdate({
                userId: req.user._id,
                _id: entryId,
                taskId
            }, {$set: changes}, {returnDocument: 'after'});
            return res.status(200).json(entry);
        } catch (error) {
            res.status(500).json({message: error.message});
        }
    }
}

const deleteEntry = (req, res) => {
    if (req.user) {
        const {entryId, taskId} = req.body;
        const userId = req.user._id;

        if (!entryId) return res.status(400).json({message: "Entry Id required."});

        if (!taskId) return res.status(400).json({message: "Task Id required."})

        Entry.findByIdAndDelete({userId, taskId, _id: entryId}, (err) => {
            if (err) res.status(500).json({message: "Failed to delete entry."});

            res.status(200).json({message: "Entry deleted successfully."});
        });
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

const deleteTaskEntries = async (req, res) => {
    if (req.user) {
        const {taskId} = req.body;

        if (!taskId) return res.status(400).json({message: "Task id required."});

        await Entry.deleteMany({userId: req.user._id, taskId: taskId});
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

const addEntry = async (req, res) => {
    if (req.user) {
        const {date, value, taskId} = req.body;

        if (!date || isNaN(value) || !taskId) return res.status(400).json({message: "Date, value and task id required."});

        try {
            const entry = await Entry.create({date, value, taskId, userId: req.user._id});
            res.status(200).json({entry});
        } catch (error) {
            res.status(500).json({message: error.message});
        }
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

module.exports = {
    getRecentEntries,
    getTaskEntries,
    setEntryValue,
    deleteEntry,
    deleteTaskEntries,
    getTaskEntryById,
    addEntry,
    setEntry,
    entrySchema
};
