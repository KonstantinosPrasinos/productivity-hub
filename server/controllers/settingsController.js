const Settings = require('../models/settingsSchema')

const getSettings = async (req, res) => {
    if (req.user) {
        const userId = req.user._id;

        Settings.findOne({'userId': userId}, async (err, settings) => {
            if (settings) {return res.status(200).json({...settings._doc, _id: undefined, __v: undefined, userId: undefined})}

            return res.status(404).json({message: 'Settings not found.'});
        });
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

const updateSettings = async (req, res) => {
    if (req.user) {
        const theme = ['Light', 'Dark', 'Default'].includes(req.body.theme) ? req.body.theme : undefined;
        const defaultStep = !isNaN(req.body.defaults?.step) ? req.body.defaults?.step : undefined;
        const defaultPriority = !isNaN(req.body.defaults?.priority) ? req.body.defaults?.priority : undefined;
        const defaultGoal = !isNaN(req.body.defaults?.goal) ? req.body.defaults?.goal : undefined;

        let update = {};

        if (theme) {
            update['theme'] = theme;
        }

        if (defaultStep) {
            update['defaults.step'] = defaultStep;
        }

        if (defaultPriority) {
            update['defaults.priority'] = defaultPriority;
        }

        if (defaultGoal) {
            update['defaults.goal'] = defaultGoal;
        }

        const settings = await Settings.findOneAndUpdate({'userId': req.user._id}, {$set: update}, {new: true});

        if (settings) {
            res.status(200).json({...settings._doc, _id: undefined, __v: undefined, userId: undefined});
        } else {
            res.status(404).json({message: 'Settings not found.'})
        }
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

module.exports = {getSettings, updateSettings};