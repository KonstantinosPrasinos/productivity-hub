const Group = require('../models/groupSchema');
const Task = require('../models/taskSchema');
const Joi = require('joi');

const groupSchema = Joi.object({
    title: Joi.string().required(),
    priority: Joi.number().required(),
    repeatRate: Joi.object().keys({
        number: Joi.number().integer().min(1),
        bigTimePeriod: Joi.string().valid('Days', 'Weeks', 'Months', 'Years'),
        smallTimePeriod: Joi.array().items(Joi.string()),
        startingDate: Joi.array().items(Joi.number()),
        // time: Joi.object().keys({
        //     starting: Joi.number().integer().min(0),
        //     ending: Joi.number().integer().max(2400)
        // })
    })
});

const getGroups = async (req, res) => {
    if (req.user) {
        Group.find({userId: req.user._id}, (err, groups) => {
            if (groups) {return res.status(200).json({groups})}

            return res.status(404).json({message: 'Groups not found.'});
        });
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

const createGroup = async (req, res) => {
    if (req.user) {
        const {group} = req.body;

        const validatedGroup = groupSchema.validate(group);

        if (validatedGroup.error) {
            return res.status(400).json({message: validatedGroup.error});
        }

        try {
            const newGroup = await Group.create({
                ...validatedGroup.value,
                userId: req.user._id
            });
            res.status(200).json(newGroup);
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

const deleteGroup = async (req, res) => {
    if (req.user) {
        const {groupIds, action} = req.body;

        try {
            let editedTasks;

            // Get the ids of the tasks that are about to be deleted or edited
            editedTasks = await Task.find({userId: req.user._id, group: {$in: groupIds}});
            editedTasks = editedTasks.map(task => task._id);

            switch (action) {
                case "Keep their repeat details":
                    await Task.updateMany({userId: req.user._id, group: {$in: groupIds}}, {group: ""});
                    break;
                case "Remove their repeat details":
                    await Task.updateMany(
                        {userId: req.user._id, group: {$in: groupIds}},
                        [
                            {$unset: {group: ""}},
                            {$set:
                                    {
                                        repeatRate: {
                                            time: {},
                                            smallTimePeriod: [],
                                            startingDate: []
                                        },
                                        repeats: false
                                    }
                            }
                        ],
                        {returnDocument: 'after'}
                    );
                    break;
                case "Delete them":
                    await Task.deleteMany({userId: req.user._id, group: {$in: groupIds}});
                    break;
            }

            await Group.deleteMany({userId: req.user._id, _id: {$in: groupIds}});

            return res.status(200).json({message: 'Groups deleted successfully.', affectedTasks: editedTasks});
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

const setGroups = async (req, res) => {
    if (req.user) {
        const {groups} = req.body;

        try {
            const newGroups = [];

            for (const group of groups) {
                newGroups.push(await Group.findOneAndUpdate({userId: req.user._id, _id: group._id}, group, {returnDocument: 'after'}));
            }

            return res.status(200).json({newGroups});
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

module.exports = {getGroups, createGroup, deleteGroup, groupSchema, setGroups};