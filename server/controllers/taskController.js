const Task = require('../models/taskSchema');
const Joi = require('joi');
const TaskHistory = require("../models/taskHistorySchema");

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

const getDateAddDetails = (bigTimePeriod, number) => {
    let timeToAdd = number, functionName;

    switch(bigTimePeriod) {
        case 'Days':
            functionName = 'Date';
            break;
        case 'Weeks':
            functionName = 'Date';
            timeToAdd *= 7;
            break;
        case 'Months':
            functionName = 'Month';
            break;
        case 'Years':
            functionName = 'FullYear'
            break;
        default:
            functionName = 'Date';
            break;
    }

    return {functionName, timeToAdd};
}

const findMostRecentDate = (task) => {
    const date = new Date(task.mostRecentProperDate);

    const currentDate = new Date();

    const {functionName, timeToAdd} = getDateAddDetails(task.repeatRate.bigTimePeriod, task.repeatRate.number);

    
    while(currentDate.getTime() > date.getTime()) {
        date[`set${functionName}`](date[`get${functionName}`]() + timeToAdd);
    }

    return date.getTime();
}

const assembleEntryHistory = (entries, task) => {
    const {functionName, timeToAdd} = getDateAddDetails(task.repeatRate.bigTimePeriod, task.repeatRate.number);

    const date = new Date(task.mostRecentProperDate);
    date.setUTCHours(0, 0, 0, 0)

    let properEntries = "0".repeat(7);

    for (let i = 0; i < entries.length; i++) {
        date[`set${functionName}`](date[`get${functionName}`]() - timeToAdd);

        const entryFound = entries.find(entry => {
            entry.setUTCHours(0, 0, 0, 0);

            return entry.getTime() === date.getTime();
        })

        if (entryFound) {
            properEntries = properEntries.substring(0, properEntries.length - i - 1) + '1' + properEntries.substring(properEntries.length - i + 1);
        }
    }

    return properEntries;
}

const getTasksWithHistory = async (tasks, userId) => {
    let tasksWithHistory = []

    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].repeats) {
            const entriesHistory = await TaskHistory
                .find({"$and": [{userId: userId}, {taskId: tasks[i]._id}]})
                .sort({ $natural: -1 })
                .limit(7)
                .exec();

            if (entriesHistory.length) {
                const entryDates = entriesHistory.map(entry => {
                    return new Date(entry.createdAt);
                })

                const mostRecentDate = findMostRecentDate(tasks[i]);

                const editedTask = await Task.findByIdAndUpdate(tasks[i]._id, {"$set": {"mostRecentProperDate": mostRecentDate}}, {new: true});
                const streak = assembleEntryHistory(entryDates, editedTask);

                tasksWithHistory.push({...editedTask._doc, streak: streak})
            } else {
                const temp = {...tasks[i]._doc, streak: "0000000"}
                tasksWithHistory.push(temp);
            }
        } else {
            tasksWithHistory.push(tasks[i]);
        }
    }

    return tasksWithHistory;
}

const getTasks = async (req, res) => {
    if (req.user) {
        Task.find({userId: req.user._id}, async (err, tasks) => {
            if (err) return res.status(404).json({message: 'Tasks not found.'});

            if (tasks) {return res.status(200).json({tasks: await getTasksWithHistory(tasks, req.user._id)})}

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