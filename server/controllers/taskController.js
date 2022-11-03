const Task = require('../models/taskSchema');

const getTasks = async (req, res) => {
    if (req.user) {
        const userId = req.user._id;

        Task.find({userId: userId}, (err, tasks) => {
            if (tasks) {return res.status(200).json(tasks)}

            return res.status(404).json({message: 'Tasks not found.'});
        });
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

module.exports = {getTasks};