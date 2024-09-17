const Settings = require('../models/settingsSchema');
const Joi = require('joi');

const settingsSchema = Joi.object({
    theme: Joi.string().valid('Light', 'Dark', 'Device'),
    confirmDelete: Joi.boolean(),
    defaults: Joi.object().keys({
        step: Joi.number().min(0),
        priority: Joi.number(),
        goal: Joi.number().min(0),
        deleteGroupAction: Joi.string().valid('Keep their repeat details', 'Remove their repeat details', 'Delete them')
    })
});

const getSettings = async (req, res) => {
    if (req.user) {
        const userId = req.user._id;

        Settings.findOne({'userId': userId}, async (err, settings) => {
            if (settings) {
                return res.status(200).json({
                    ...settings._doc,
                    _id: undefined,
                    __v: undefined,
                    userId: undefined,
                    priorityBounds: {low: 1, high: 1}
                })
            }

            const createdSettings = await Settings.create({userId});

            return res.status(200).json({
                ...createdSettings._doc,
                _id: undefined,
                __v: undefined,
                userId: undefined,
                priorityBounds: {low: 1, high: 1}
            })
        });
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

const updateSettings = async (req, res) => {
    if (req.user) {
        const {settings} = req.body;
        const validatedSettings = settingsSchema.validate(settings);

        if (validatedSettings.error) {
            return res.status(400).json({message: validatedSettings.error});
        }

        Settings.findOneAndUpdate({'userId': req.user._id}, {$set: validatedSettings.value}, {new: true}, (err, doc) => {
            if (err) {
                return res.status(500).json({message: err});
            }

            return res.status(200).json({...doc._doc, _id: undefined, __v: undefined, userId: undefined});
        });
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

module.exports = {getSettings, updateSettings, settingsSchema};