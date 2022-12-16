const Entry = require('../models/entrySchema');

async function deleteTaskEntries(userId, taskId) {
    let filter = {userId};

    if (Array.isArray(taskId)){
        filter.taskId = {$in: taskId}
    } else {
        filter.taskId = taskId;
    }

    await Entry.deleteMany(filter);
}

module.exports = {deleteTaskEntries}