const {deleteTaskEntries} = require("./deleteTaskEntries");

const Task = require("../models/taskSchema");

async function deleteGroupTasks(userId, categoryId) {
    const tasks = await Task.find({userId, category: categoryId});
    await Task.deleteMany({userId, category: categoryId});

    if (tasks?.length > 0) {
        await deleteTaskEntries(userId, tasks.map(task => task._id));
    }
}

module.exports = {deleteGroupTasks};