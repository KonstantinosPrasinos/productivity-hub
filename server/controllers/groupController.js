const Group = require('../models/groupSchema');
const Joi = require('joi');

const groupSchema = Joi.object({
    title: Joi.string().required(),
    priority: Joi.number().required(),
    repeatRate: Joi.object().keys({
        number: Joi.number().integer().min(1),
        bigTimePeriod: Joi.string().valid('Days', 'Weeks', 'Months', 'Years'),
        smallTimePeriod: Joi.array().items(Joi.string()),
        startingDate: Joi.array().items(Joi.number()),
        time: Joi.object().keys({
            starting: Joi.number().integer().min(0),
            ending: Joi.number().integer().max(2400)
        })
    }),
    parent: Joi.string().required()
})

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
        const {groupId} = req.body;

        Group.findByIdAndDelete(groupId, (err) => {
            if (err) {
                return res.status(500).json({message: err});
            }

            return res.status(200).json({message: 'Group deleted successfully.'})
        })
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

module.exports = {getGroups, createGroup, deleteGroup};