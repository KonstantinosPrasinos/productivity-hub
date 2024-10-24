const Task = require("../models/taskSchema");
const Entry = require("../models/entrySchema");
const { taskSchema } = require("./taskController");
const {
  categorySchema,
  handleCreateCategory,
} = require("./categoryController");
const Category = require("../models/categorySchema");
const { createGroupFunction } = require("../functions/createGroupFunction");
const { editGroup } = require("../functions/editGroups");
const { entrySchema } = require("./entryController");
const { settingsSchema } = require("./settingsController");
const Settings = require("../models/settingsSchema");
const { deleteGroupTasks } = require("../functions/deleteGroupTasks");
const Group = require("../models/groupSchema");

const handleSync = async (req, res) => {
  if (req.user) {
    const {
      newTasks,
      editedTasks,
      deletedTasks,
      newCategories,
      editedCategories,
      deletedCategories,
      newGroups,
      editedGroups,
      newEntries,
      editedEntries,
      settingsToSync,
      deletedEntries,
      deletedGroups,
    } = req.body;

    const errors = {
      taskCreationErrors: [],
      taskEditErrors: [],
      taskDeleteErrors: [],
      categoryCreationErrors: [],
      categoryEditErrors: [],
      groupCreationErrors: [],
      groupEditErrors: [],
      groupDeleteErrors: [],
      entryCreationErrors: [],
      entryEditErrors: [],
      settingsEditErrors: [],
      categoryDeleteErrors: [],
      entryDeleteErrors: [],
    };

    const tasksResponse = [];
    const entriesResponse = [];

    const currentDate = new Date();
    currentDate.setUTCHours(0, 0, 0, 0);

    for (const task of editedTasks) {
      const validatedTask = taskSchema.validate(task);

      if (validatedTask.error) {
        errors.taskEditErrors.push(validatedTask.error);
        continue;
      }

      delete validatedTask.value._id;

      try {
        const newTask = await Task.findOneAndUpdate(
          { _id: task._id, userId: req.user._id },
          validatedTask.value,
          { returnDocument: "after" },
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
        const newEntry = await Entry.findOneAndUpdate(
          {
            _id: entry._id,
            userId: req.user._id,
          },
          validatedEntry.value,
          { returnDocument: "after" },
        );

        if (newEntry) {
          // todo handle all stuff like this because it may help with editing something that has been deleted.
          // if false here then tell the user an edit was attempted to be made to something that was deleted
          entriesResponse.push(newEntry);
        }
      } catch (error) {
        errors.entryEditErrors.push(error.message);
      }
    }

    const categoriesResponse = [];
    const groupsResponse = [];

    // This property is to change temporary category ids to the new ids before adding new tasks
    const newCategoryIdMap = {};
    let newGroupIdMap = {};

    for (const category of newCategories) {
      try {
        const tempCategory = { ...category };
        delete tempCategory.groups;
        delete tempCategory._id;

        const {
          newCategory,
          newGroups,
          newGroupIdMap: tempNewGroupIdMap,
        } = await handleCreateCategory(
          tempCategory,
          category.groups,
          req.user._id,
        );

        newGroupIdMap = { ...newGroupIdMap, ...tempNewGroupIdMap };

        categoriesResponse.push(newCategory);

        newCategoryIdMap[category._id] = newCategory._id;

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
        errors.categoryEditErrors.push(validatedCategory.error);
      }

      try {
        const newCategory = await Category.findOneAndUpdate(
          { _id: category._id, userId: req.user._id },
          validatedCategory.value,
          { returnDocument: "after" },
        );

        categoriesResponse.push(newCategory);
      } catch (error) {
        errors.categoryEditErrors.push(error.message);
      }
    }

    for (const group of newGroups) {
      const createGroupResponse = await createGroupFunction(
        { ...group, _id: undefined },
        req.user._id,
        group.parent,
      );

      if (createGroupResponse?.message) {
        errors.groupCreationErrors.push(createGroupResponse.message);
      } else {
        groupsResponse.push(createGroupResponse.newGroup);

        newGroupIdMap[group._id] = createGroupResponse.newGroup?._id;
      }
    }

    for (const task of newTasks) {
      try {
        const tempTask = { ...task };
        delete tempTask.entries;

        if (task?.category) {
          if (newCategoryIdMap.hasOwnProperty(task?.category)) {
            tempTask.category = newCategoryIdMap[task?.category].toString();
          }
        }

        if (task?.group) {
          if (newGroupIdMap.hasOwnProperty(task?.group)) {
            tempTask.group = newGroupIdMap[task?.group].toString();
          }
        }

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
              date: entry.date,
            });

            if (entry.date === currentDate.toISOString()) {
              currentEntryId = newEntry._id;
            }

            entriesResponse.push(newEntry._doc);
          } catch (error) {
            errors.entryCreationErrors.push(error.message);
          }
        }

        if (!currentEntryId) {
          const newEntry = await Entry.create({
            taskId: newTask._id,
            userId: req.user._id,
          });

          currentEntryId = newEntry._id;

          entriesResponse.push(newEntry._doc);
        }

        tasksResponse.push({
          ...newTask._doc,
          mostRecentProperDate: undefined,
          currentEntryId: currentEntryId,
          streak: { number: 0, date: null },
          totalCompletedEntries: 0,
          totalNumber: newTask._doc.type === "Number" ? 0 : undefined,
        });
      } catch (error) {
        errors.taskCreationErrors.push(error.message);
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

    for (const group of deletedGroups) {
      try {
        await Task.updateMany(
          { userId: req.user._id, _id: group._id },
          { $set: { forDeletion: true } },
        );
      } catch (error) {
        errors.groupDeleteErrors.push(error.message);
      }
    }

    for (const entry of newEntries) {
      try {
        const validatedEntry = entrySchema.validate(entry);

        if (validatedEntry.error) {
          errors.entryCreationErrors.push(validatedEntry.error);
        }

        const newEntry = await Entry.create({
          ...validatedEntry.value,
          userId: req.user._id,
        });

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
            { userId: req.user._id },
            { $set: validatedSettings.value },
            { returnDocument: "after" },
          );

          settingsResponse = newSettings._doc;
        } catch (error) {
          errors.settingsEditErrors.push(error.message);
        }
      } else {
        errors.settingsEditErrors.push(validatedSettings.error);
      }
    }

    for (const task of deletedTasks) {
      try {
        await Task.updateMany(
          { userId: req.user._id, _id: task._id },
          { $set: { forDeletion: true } },
        );

        await Entry.updateMany(
          { userId: req.user._id, taskId: task._id },
          { $set: { forDeletion: true } },
        );
      } catch (error) {
        errors.taskDeleteErrors.push(error.message);
      }
    }

    for (const category of deletedCategories) {
      try {
        if (category?.deleteTasks) {
          await deleteGroupTasks(req.user._id, category._id);
        }

        await Category.deleteOne({
          userId: req.user._id,
          _id: category._id,
        });
        await Group.deleteMany({
          userId: req.user._id,
          parent: category._id,
        });
      } catch (error) {
        errors.categoryDeleteErrors.push(error.message);
      }
    }

    for (const entry of deletedEntries) {
      try {
        await Entry.deleteOne({ userId: req.user._id, _id: entry._id });
      } catch (error) {
        errors.entryDeleteErrors.push(error.message);
      }
    }

    // todo add response object only for new stuff or for when an error occurs (minimises unneeded data transport)

    return res.status(200).json({
      tasks: tasksResponse,
      categories: categoriesResponse,
      groups: groupsResponse,
      entries: entriesResponse,
      settings: settingsResponse,
      errors,
    });
  } else {
    res.status(401).send({ message: "Not authorized." });
  }
};

module.exports = { handleSync };
