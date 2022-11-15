const Task = require('../models/taskSchema');
const Joi = require('joi');

const taskSchema = Joi.object({
    title: Joi.string().required(),
    type: Joi.string().valid('Checkbox', 'Number'),
    step: Joi.number().min(0),
    goal: Joi.object().keys({
        type: Joi.string().valid('None', 'At most', 'Exactly', 'At least'),
        number: Joi.number().min(0)
    }),
    category: Joi.string(),
    priority: Joi.number().integer().required(),
    repeats: Joi.boolean().required(),
    longGoal: Joi.object(),
    expiresAt: Joi.object().keys({
        type: Joi.string().valid('Never', 'Date', 'End of goal'),
        timePeriod: Joi.string()
    }),
    timeGroup: Joi.string(),
    repeatRate: Joi.object().keys({
        number: Joi.number().integer().min(1),
        bigTimePeriod: Joi.string().valid('Days', 'Weeks', 'Months', 'Years'),
        smallTimePeriod: Joi.array().items(Joi.string()),
        startingDate: Joi.array().items(Joi.number()),
        time: Joi.object().keys({
            starting: Joi.number().integer().min(0),
            ending: Joi.number().integer().max(2400)
        })
    })
})

const getTasks = async (req, res) => {
    if (req.user) {
        Task.find({userId: req.user._id}, (err, tasks) => {
            if (tasks) {return res.status(200).json({tasks})}

            return res.status(404).json({message: 'Tasks not found.'});
        });
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

const createTask = async (req, res) => {
    if (req.user) {
        const {task} = req.body;

        const validatedTask = taskSchema.validate(task);

        if (validatedTask.error) {
            return res.status(400).json({message: validatedTask.error});
        }

        try {
            const newTask = await Task.create({
                ...validatedTask.value,
                userId: req.user._id,
                previousEntries: {
                    value: '000000',
                    latest: (new Date()).getTime(),
                    mostRecent: 0
                }
            });
            res.status(200).json(newTask);
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

const deleteTask = async (req, res) => {
    if (req.user) {
        const {taskId} = req.body;

        Task.findByIdAndDelete(taskId, (err) => {
            if (err) {
                return res.status(500).json({message: err});
            }

            return res.status(200).json({message: 'Task deleted successfully.'})
        })
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

module.exports = {getTasks, createTask, deleteTask};