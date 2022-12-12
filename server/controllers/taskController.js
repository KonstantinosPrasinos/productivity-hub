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
    const date = new Date();

    if (task.mostRecentProperDate) {
        date.setTime(task.mostRecentProperDate.getTime());
    } else {
        date.setTime(task.repeatRate.startingDate.getTime());
    }

    date.setUTCHours(0, 0, 0, 0);

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
    date.setUTCHours(0, 0, 0, 0);

    let properEntries = "0".repeat(7);

    for (let i = 0; i < entries.length; i++) {
        date[`set${functionName}`](date[`get${functionName}`]() - timeToAdd);

        const entryFound = entries.find(entry => {
            entry.createdAt.setUTCHours(0, 0, 0, 0);

            return entry.createdAt.getTime() === date.getTime();
        })

        if (entryFound) {

            let addedValue = '0';

            if (task.type === 'Checkbox') {
                if (entryFound?.value === 1) {
                    addedValue = '3';
                }
            } else {
                switch(task.goal.type) {
                    case 'None':
                        if (entryFound?.value > 0) {
                            addedValue = '3';
                        }
                        break;
                    case 'At most':
                        if (entryFound?.value > 0) {
                            if (entryFound?.value < task.goal.number) {
                                addedValue = '3';
                            } else if (entryFound?.value === task.goal.number) {
                                addedValue = '1';
                            }
                        }
                        break;
                    case 'Exactly':
                        if (entryFound?.value === task.goal.number) {
                            addedValue = '3';
                        }
                        break;
                    case 'At least':
                        if (entryFound?.value >= task.goal.number) {
                            addedValue = '3';
                        } else if (entryFound?.value >= Math.ceil(task.goal.number / 2)) {
                            addedValue = '2';
                        } else if (entryFound?.value > 0) {
                            addedValue = '1';
                        }
                        break;
                }
            }

            properEntries = properEntries.substring(0, properEntries.length - 1 - i) + addedValue + properEntries.substring(properEntries.length, properEntries.length - i);
        }
    }

    return properEntries;
}

const getTasksWithHistory = async (tasks, userId) => {
    let tasksWithHistory = [];
    const currentDate = new Date();
    currentDate.setUTCHours(0, 0, 0, 0);

    // Add current entry to tasks
    let tasksWithCurrentEntry = [];

    for (const task of tasks) {
        const currentEntry = await TaskHistory
            .findOne({userId: userId, taskId: task._id, createdAt: {$gt: currentDate}})
            .exec();

        let currentEntryValue;

        if (currentEntry) {
            currentEntryValue = currentEntry.value;
        } else {
            currentEntryValue = 0;
        }

        tasksWithCurrentEntry.push({...task._doc, currentEntryValue: currentEntryValue})
    }

    // Add streak to tasks
    for (let i = 0; i < tasksWithCurrentEntry.length; i++) {
        if (tasksWithCurrentEntry[i].repeats) {
            const entriesHistory = await TaskHistory
                .find({userId: userId, taskId: tasksWithCurrentEntry[i]._id, createdAt: {$lt: currentDate}})
                .sort({ $natural: -1 })
                .limit(7)
                .exec();

            if (entriesHistory.length) {
                const mostRecentDate = findMostRecentDate(tasksWithCurrentEntry[i]);

                const editedTask = await Task.findByIdAndUpdate(tasksWithCurrentEntry[i]._id, {"$set": {"mostRecentProperDate": mostRecentDate}}, {new: true});
                const streak = assembleEntryHistory(entriesHistory, editedTask);

                tasksWithHistory.push({...editedTask._doc, streak: streak, currentEntryValue: tasksWithCurrentEntry[i].currentEntryValue, mostRecentProperDate: undefined});
            } else {

                tasksWithHistory.push({...tasksWithCurrentEntry[i], currentEntryValue: 0, streak: "0000000", mostRecentProperDate: undefined});
            }
        } else {
            tasksWithHistory.push({...tasksWithCurrentEntry[i], currentEntryValue: 0, mostRecentProperDate: undefined});
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

            res.status(200).json({
                ...newTask._doc,
                currentEntryValue: 0,
                streak: newTask.repeats ? "0000000" : undefined,
                mostRecentProperDate: undefined});
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

        Task.findByIdAndDelete(taskId, (err, doc) => {
            if (err) {
                return res.status(500).json({message: err});
            }

            return res.status(200).json({taskId: doc._id});
        })
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

module.exports = {getTasks, createTask, deleteTask};