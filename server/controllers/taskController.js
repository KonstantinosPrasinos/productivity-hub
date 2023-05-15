const Task = require('../models/taskSchema');
const Joi = require('joi');
const Entry = require("../models/entrySchema");

const taskSchema = Joi.object({
    title: Joi.string().required(),
    type: Joi.string().valid('Checkbox', 'Number').required(),
    step: Joi.number().min(1),
    goal: Joi.object().keys({
        type: Joi.string().valid('At most', 'Exactly', 'At least'),
        number: Joi.number().min(1)
    }),
    category: Joi.string(),
    priority: Joi.number().integer().required(),
    repeats: Joi.boolean().required(),
    longGoal: Joi.object().when('repeats', {is: true, then: Joi.optional(), otherwise: Joi.forbidden()}).keys({
        type: Joi.string().valid('Streak', 'Total completed', 'Total number'),
        limit: Joi.string().valid('At most', 'Exactly', 'At least'),
        number: Joi.number().min(1)
    }),
    // expiresAt: Joi.object().keys({
    //     type: Joi.string().valid('Never', 'Date', 'End of goal'),
    //     timePeriod: Joi.string()
    // }),
    group: Joi.string().when('repeats', {is: true, then: Joi.optional(), otherwise: Joi.forbidden()}),
    repeatRate: Joi.object().when('repeats', {is: true, then: Joi.required(), otherwise: Joi.forbidden()}).keys({
        number: Joi.number().integer().min(1),
        bigTimePeriod: Joi.string().valid('Days', 'Weeks', 'Months', 'Years'),
        smallTimePeriod: Joi.array().items(Joi.string()),
        startingDate: Joi.array().items(Joi.date()),
        time: Joi.object().keys({
            start: Joi.string(),
            end: Joi.string()
        })
    }),
    _id: Joi.string()
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

const findMostRecentDate = (task, currentDate = null) => { // current date for tests
    const date = new Date();

    if (task.mostRecentProperDate) {
        date.setTime(task.mostRecentProperDate.getTime());
    } else {
        date.setTime(task.repeatRate.startingDate[0].getTime());
    }

    if (!currentDate) {
        currentDate = new Date();
    }

    currentDate.setUTCHours(0, 0, 0, 0);

    const {functionName, timeToAdd} = getDateAddDetails(task.repeatRate.bigTimePeriod, task.repeatRate.number);

    while(currentDate.getTime() > date.getTime()) {
        date[`set${functionName}`](date[`get${functionName}`]() + timeToAdd);
    }

    return date;
}

const getTotalCompletedEntries = (entries, task) => {
    let total = 0;

    for (const entry of entries) {
        switch (task.type) {
            case "Checkbox":
                if (entry.value === 1) {
                    total++;
                }
                break;
            case "Number":
                switch (task.goal.type) {
                    case "At least":
                        if (entry.value >= task.goal.number) {
                            total++;
                        }
                        break;
                    case "Exactly":
                        if (entry.value === task.goal.number) {
                            total++;
                        }
                        break;
                    case "At most":
                        if (entry.value <= task.goal.number) {
                            total++;
                        }
                        break;
                }
                break;
            default: break;
        }
    }

    return total;
}

const getTotalNumber = (entries) => {
    let total = 0;

    for (const entry of entries) {
        total += entry.value;
    }

    return total;
}

const assembleEntryHistory = (entries, task, currentDate = null) => { // current date for tests
    let streak = 0;
    let streakStartDate = null;
    const {functionName, timeToAdd} = getDateAddDetails(task.repeatRate.bigTimePeriod, task.repeatRate.number);

    if (!currentDate) {
        currentDate = new Date();
    }

    currentDate.setUTCHours(0, 0, 0, 0);

    const date = new Date(task.mostRecentProperDate);
    date.setUTCHours(0, 0, 0, 0);

    if (date.getTime() === currentDate.getTime()) {
        date[`set${functionName}`](date[`get${functionName}`]() - timeToAdd);
    }

    let entryFound = true;

    while(entryFound) {
        for (let i = task.repeatRate.startingDate.length - 1; i >= 0; i--) {
            let timeDifference = task.repeatRate.startingDate[i] - task.repeatRate.startingDate[0];
            timeDifference = timeDifference / (24 * 3600 * 1000); // Turn into days

            date.setDate(date.getDate() + timeDifference);

            entryFound = entries.find(entry => {
                if (entry.date.getTime() === date.getTime()) {
                    if (task.type === "Checkbox") {
                        return entry.value === 1;
                    } else {
                        switch (task.goal.type) {
                            case "At least":
                                if (entry.value >= task.goal.number) {
                                    return true;
                                }
                                break;
                            case "Exactly":
                                if (entry.value === task.goal.number) {
                                    return true;
                                }
                                break;
                            case "At most":
                                if (entry.value <= task.goal.number) {
                                    return true;
                                }
                                break;
                            default: break;
                        }
                    }
                }

                return false;
            });

            if (entryFound) {
                streak++;
                streakStartDate = date.getTime();
            } else {
                break;
            }

            date.setDate(date.getDate() - timeDifference);
        }

        date[`set${functionName}`](date[`get${functionName}`]() - timeToAdd);
    }

    return {streak, date: streakStartDate ? new Date(streakStartDate) : streakStartDate};
}

const getTasksWithHistory = async (tasks, userId) => {
    let tasksWithHistory = [];
    const currentDate = new Date();
    currentDate.setUTCHours(0, 0, 0, 0);

    // Add current entry to tasks
    let tasksWithCurrentEntry = [];

    for (const task of tasks) {
        let currentEntry = await Entry.findOne({userId: userId, taskId: task._id, date: currentDate});

        if (!currentEntry) {
            currentEntry = await Entry.create({userId: userId, taskId: task._id})
        }

        tasksWithCurrentEntry.push({...task._doc, currentEntryId: currentEntry._id, forDeletion: undefined, hidden: false}) // Remove the for deletion property, add the hidden property
    }

    // Add streak to tasks
    for (let i = 0; i < tasksWithCurrentEntry.length; i++) {
        if (tasksWithCurrentEntry[i].repeats) {
            const entriesHistory = await Entry
                .find({userId: userId, taskId: tasksWithCurrentEntry[i]._id, date: {$lt: currentDate}, value: {$gt: 0}})
                .sort({date: -1})
                .exec();

            if (entriesHistory.length) {
                const mostRecentDate = findMostRecentDate(tasksWithCurrentEntry[i]);

                let editedTask = await Task.findOneAndUpdate(
                    {userId: userId, _id: tasksWithCurrentEntry[i]._id},
                    {"$set": {"mostRecentProperDate": mostRecentDate}},
                    {new: true}
                );

                const {streak, date: streakFrom} = assembleEntryHistory(entriesHistory, editedTask);

                if (!editedTask.repeatStats?.longestStreak?.number || editedTask.repeatStats.longestStreak.number < streak) {
                    // If current streak is longer than longest, replace longest with current
                    editedTask = await Task.findOneAndUpdate(
                        {userId: userId, _id: tasksWithCurrentEntry[i]._id},
                        {"$set": {"mostRecentProperDate": mostRecentDate, "repeatStats.longestStreak.number": streak, "repeatStats.longestStreak.date": streakFrom}},
                        {new: true}
                    )
                }

                const totalCompletedEntries = getTotalCompletedEntries(entriesHistory, editedTask);

                if (editedTask.type === "Number") {
                    const totalNumber = getTotalNumber(entriesHistory);

                    tasksWithHistory.push({
                        ...editedTask._doc,
                        streak: {number: streak, date: streakFrom},
                        currentEntryId: tasksWithCurrentEntry[i].currentEntryId,
                        totalCompletedEntries,
                        totalNumber
                    });
                } else {
                    tasksWithHistory.push({
                        ...editedTask._doc,
                        streak: streak,
                        currentEntryId: tasksWithCurrentEntry[i].currentEntryId,
                        totalCompletedEntries
                    });
                }
            } else {
                tasksWithHistory.push({...tasksWithCurrentEntry[i], streak: {number: 0, date: null}, totalCompletedEntries: 0, totalNumber: 0});
            }
        } else {
            tasksWithHistory.push({...tasksWithCurrentEntry[i]});
        }
    }

    return tasksWithHistory;
}

const getTasks = async (req, res) => {
    if (req.user) {
        Task.find({userId: req.user._id, forDeletion: false}, async (err, tasks) => {
            if (err) return res.status(404).json({message: 'Tasks not found.'});

            const tasksWithHistory = await getTasksWithHistory(tasks, req.user._id)

            if (tasks) {return res.status(200).json({tasks: tasksWithHistory})}

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

        validatedTask.value._id = undefined;

        try {
            const newTask = await Task.create({...validatedTask.value, userId: req.user._id});
            const entry = await Entry.create({userId: req.user._id, taskId: newTask._id});

            res.status(200).json({
                ...newTask._doc,
                mostRecentProperDate: undefined,
                currentEntryId: entry._id,
                streak: {number: 0, date: null},
                totalCompletedEntries: 0,
                totalNumber: newTask._doc.type === "Number" ? 0 : undefined
            });
        } catch (error) {
            res.status(400).json({message: error.message})
        }
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

const deleteTask = async (req, res) => {
    if (req.user) {
        const {taskId} = req.body;

        try {
            await Task.updateMany({userId: req.user._id, _id: taskId}, {$set: {forDeletion: true}});

            await Entry.updateMany({userId: req.user._id, taskId: taskId}, {$set: {forDeletion: true}});

            res.status(200).json({message: "Task and it's entries set for deletion."});
        } catch (error) {
            res.status(500).json({message: error.message});
        }
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

const undoDeleteTask = async (req, res) => {
    if (req.user) {
        const {taskId} = req.body;

        try {
            await Task.updateMany({userId: req.user._id, _id: taskId}, {$set: {forDeletion: false}});

            await Entry.updateMany({userId: req.user._id, taskId: taskId}, {$set: {forDeletion: false}});

            res.status(200).json({message: "Task and it's entries set for deletion."});
        } catch (error) {
            res.status(500).json({message: error.message});
        }
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

const setTask = async (req, res) => {
    if (req.user) {
        const {task} = req.body;

        const validatedTask = taskSchema.validate(task);

        if (validatedTask.error) {
            return res.status(400).json({message: validatedTask.error});
        }

        validatedTask.value._id = undefined

        try {
            const newTask = await Task.findOneAndUpdate({_id: task._id, userId: req.user._id}, validatedTask.value, {returnDocument: 'after'});

            return res.status(200).json(newTask);
        } catch (error) {
            res.status(500).json({message: error.message});
        }
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

module.exports = {getTasks, createTask, deleteTask, setTask, undoDeleteTask, assembleEntryHistory, getDateAddDetails, findMostRecentDate};