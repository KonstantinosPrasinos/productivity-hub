const Settings = require('../models/settingsSchema')

const getSettings = async (req, res) => {
    if (req.user) {
        const userId = req.user._id;

        Settings.findOne({'userId': userId}, async (err, settings) => {
            if (settings) {return res.json(settings)}

            const newSettings = await Settings.create({userId: userId});

            return res.json(newSettings);
        });
    } else {
        res.status(401).send("Not authorized");
    }
}

module.exports = {getSettings};