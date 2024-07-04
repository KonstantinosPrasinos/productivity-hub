const Group = require("../models/groupSchema");
const Task = require("../models/taskSchema");
const {groupSchema} = require("./createGroupFunction");
const CustomError = require("../models/CustomError");

async function editGroup(group, userId) {
    const validatedGroup = groupSchema.validate(group);

    if (validatedGroup.error)
        throw new CustomError(validatedGroup.error, 400);

    try {
        const editedGroup = await Group.findOneAndUpdate({
            userId, _id: group._id
        }, group, {returnDocument: 'after'});

        return {group: editedGroup};
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
}

async function editGroups(groups, userId) {
    try {
        const newGroups = [];

        for (const group of groups) {
            const editedGroup = await Group.findOneAndUpdate({
                userId,
                _id: group._id
            }, group, {returnDocument: 'after'});

            const affectedTasks = (await Task.find({userId, group: editedGroup._id})).map(task => task._id);
            await Task.updateMany({
                userId,
                group: editedGroup._doc._id
            }, {$set: {repeatRate: editedGroup._doc.repeatRate}})

            newGroups.push({...editedGroup._doc, affectedTasks: affectedTasks});
        }

        return {editedGroups: newGroups}
    } catch (error) {
        return {message: error.message}
    }
}

module.exports = {editGroups, editGroup}