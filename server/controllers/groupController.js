const Group = require('../models/groupSchema');

const getGroups = async (req, res) => {
    if (req.user) {
        const userId = req.user._id;

        Group.find({userId: userId}, (err, groups) => {
            if (groups) {return res.status(200).json(groups)}

            return res.status(404).json({message: 'Groups not found.'});
        });
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

module.exports = {getGroups};