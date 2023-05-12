const Task = require("../models/taskSchema");
const Group = require("../models/groupSchema");

async function deleteGroups(action, groupIds, userId) {
    try {
        let editedTasks;

        // Get the ids of the tasks that are about to be deleted or edited
        editedTasks = await Task.find({userId: userId, group: {$in: groupIds}});
        editedTasks = editedTasks.map(task => task._id);

        switch (action) {
            case "Keep their repeat details":
                await Task.updateMany({userId: userId, group: {$in: groupIds}}, {group: ""});
                break;
            case "Remove their repeat details":
                await Task.updateMany(
                    {userId: req.user._id, group: {$in: groupIds}},
                    [
                        {$unset: {group: ""}},
                        {$set:
                                {
                                    repeatRate: {
                                        time: {},
                                        smallTimePeriod: [],
                                        startingDate: []
                                    },
                                    repeats: false
                                }
                        }
                    ],
                    {returnDocument: 'after'}
                );
                break;
            case "Delete them":
                await Task.deleteMany({userId: userId, group: {$in: groupIds}});
                break;
        }

        await Group.deleteMany({userId: userId, _id: {$in: groupIds}});

        return {message: 'Groups deleted successfully.', affectedTasks: editedTasks}
    } catch (error) {
        return {message: error.message, isError: true}
    }
}

module.exports = {deleteGroups}