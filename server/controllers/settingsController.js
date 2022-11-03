const Settings = require('../models/settingsSchema')

const getSettings = async (req, res) => {
    if (req.user) {
        const userId = req.user._id;

        Settings.findOne({'userId': userId}, async (err, settings) => {
            if (settings) {return res.status(200).json(settings)}

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
            update.theme = theme;
        }

        const defaults = {};

        if (defaultStep) {
            defaults.step = defaultStep;
        }

        if (defaultPriority) {
            defaults.priority = defaultPriority;
        }

        if (defaultGoal) {
            defaults.goal = defaultGoal;
        }

        if (Object.keys(defaults).length !== 0) {
            update.defaults = defaults;
        }

        const settings = await Settings.findOneAndUpdate({'userId': req.user._id}, update, {new: true});

        if (settings) {
            res.status(200).json({settings: settings})
        } else {
            res.status(404).json({message: 'Settings not found.'})
        }
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

module.exports = {getSettings, updateSettings};