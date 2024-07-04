const Task = require("../models/taskSchema");
const Entry = require("../models/entrySchema");
const {taskSchema} = require("./taskController");
const {categorySchema, handleCreateCategory} = require("./categoryController");
const Category = require("../models/categorySchema");
const {createGroupFunction} = require("../functions/createGroupFunction");
const {editGroup} = require("../functions/editGroups");
const {entrySchema} = require("./entryController");
const {settingsSchema} = require("./settingsController");
const Settings = require("../models/settingsSchema");

const handleSync = async (req, res) => {
    if (req.user) {
        const {
            newTasks,
            editedTasks,
            newCategories,
            editedCategories,
            newGroups,
            editedGroups,
            newEntries,
            editedEntries,
            settingsToSync
        } = req.body;

        const errors = {
            taskCreationErrors: [],
            taskEditErrors: [],
            categoryCreationErrors: [],
            categoryEditErrors: [],
            groupCreationErrors: [],
            groupEditErrors: [],
            entryCreationErrors: [],
            entryEditErrors: [],
            settingsEditErrors: []
        };

        const tasksResponse = [];
        const entriesResponse = [];

        const currentDate = new Date();
        currentDate.setUTCHours(0, 0, 0, 0);

        for (const task of newTasks) {
            try {
                const tempTask = {...task}
                delete tempTask.entries;
                const validatedTask = taskSchema.validate(tempTask);

                if (validatedTask.error) {
                    errors.taskCreationErrors.push(validatedTask.error);
                    continue;
                }

                const newTask = await Task.create({
                    ...validatedTask.value,
                    userId: req.user._id,
                });

                let currentEntryId;

                for (const entry of task.entries) {
                    try {
                        const newEntry = await Entry.create({
                            taskId: newTask._id,
                            userId: req.user._id,
                            value: entry.value,
                            date: entry.date
                        })

                        if (entry.date === currentDate.toISOString()) {
                            currentEntryId = newEntry._id;
                        }

                        entriesResponse.push(newEntry._doc);
                    } catch (error) {
                        errors.entryCreationErrors.push(error.message)
                    }
                }

                if (!currentEntryId) {
                    const newEntry = await Entry.create({
                        taskId: newTask._id,
                        userId: req.user._id,
                    })

                    currentEntryId = newEntry._id;

                    entriesResponse.push(newEntry._doc)
                }

                tasksResponse.push({
                    ...newTask._doc,
                    mostRecentProperDate: undefined,
                    currentEntryId: currentEntryId,
                    streak: {number: 0, date: null},
                    totalCompletedEntries: 0,
                    totalNumber: newTask._doc.type === "Number" ? 0 : undefined,
                });
            } catch (error) {
                errors.taskCreationErrors.push(error.message);
            }
        }

        for (const task of editedTasks) {
            const validatedTask = taskSchema.validate(task);

            if (validatedTask.error) {
                errors.taskEditErrors.push(validatedTask.error);
                continue;
            }

            delete validatedTask.value._id;

            try {
                const newTask = await Task.findOneAndUpdate(
                    {_id: task._id, userId: req.user._id},
                    validatedTask.value,
                    {returnDocument: "after"}
                );

                tasksResponse.push(newTask);
            } catch (error) {
                errors.taskEditErrors.push(error.message);
            }
        }

        for (const entry of editedEntries) {
            const validatedEntry = entrySchema.validate(entry);

            if (validatedEntry.error) {
                errors.entryEditErrors.push(validatedEntry.error);
                continue;
            }

            delete validatedEntry.value._id;

            try {
                const newEntry = await Entry.findOneAndUpdate({
                    _id: entry._id, userId: req.user._id
                }, validatedEntry.value, {returnDocument: "after"});

                entriesResponse.push(newEntry);
            } catch (error) {
                errors.entryEditErrors.push(error.message);
            }
        }

        const categoriesResponse = [];
        const groupsResponse = [];

        for (const category of newCategories) {
            try {
                const tempCategory = {...category};
                delete tempCategory.groups;

                const {
                    newCategory,
                    newGroups
                } = await handleCreateCategory(tempCategory, category.groups, req.user._id);

                categoriesResponse.push(newCategory);

                if (newGroups) {
                    for (const group of newGroups) {
                        groupsResponse.push(group);
                    }
                }
            } catch (error) {
                errors.taskEditErrors.push(error.message);
            }
        }

        for (const category of editedCategories) {
            const validatedCategory = categorySchema.validate(category);

            if (validatedCategory.error) {
                errors.categoryEditErrors.push(validatedCategory.error)
            }

            try {
                const newCategory = await Category.findOneAndUpdate(
                    {_id: category._id, userId: req.user._id},
                    validatedCategory.value,
                    {returnDocument: "after"}
                );

                categoriesResponse.push(newCategory);
            } catch (error) {
                errors.categoryEditErrors.push(error.message);
            }
        }

        for (const group of newGroups) {
            const createGroupResponse = await createGroupFunction(group, req.user._id, group.parent);

            if (createGroupResponse?.message) {
                errors.groupCreationErrors.push(createGroupResponse.message);
            } else {
                groupsResponse.push(createGroupResponse.newGroup);
            }
        }

        for (const group of editedGroups) {
            try {
                const editGroupResponse = await editGroup(group, req.user._id);

                groupsResponse.push(editGroupResponse.group);
            } catch (error) {
                errors.groupEditErrors.push(error.message);
            }
        }

        for (const entry of newEntries) {
            try {
                const validatedEntry = entrySchema.validate(entry);

                if (validatedEntry.error) {
                    errors.entryCreationErrors.push(validatedEntry.error);
                }

                const newEntry = await Entry.create(validatedEntry.value);

                entriesResponse.push(newEntry);
            } catch (error) {
                errors.entryCreationErrors.push(error.message);
            }
        }

        // todo add edited entries

        let settingsResponse = undefined;

        if (settingsToSync) {
            const validatedSettings = settingsSchema.validate(settingsToSync);

            if (!validatedSettings.error) {
                try {
                    const newSettings = await Settings.findOneAndUpdate(
                        {userId: req.user._id},
                        {$set: validatedSettings.value},
                        {returnDocument: "after"}
                    );

                    settingsResponse = newSettings._doc;
                } catch (error) {
                    errors.settingsEditErrors.push(error.message)
                }
            } else {
                errors.settingsEditErrors.push(validatedSettings.error)
            }
        }

        // todo add response object only for new stuff or for when an error occurs (minimises unneeded data transport)

        return res.status(200).json({
            tasks: tasksResponse,
            categories: categoriesResponse,
            groups: groupsResponse,
            entries: entriesResponse,
            settings: settingsResponse,
            errors
        })
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

module.exports = {handleSync};