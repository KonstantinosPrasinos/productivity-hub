const Category = require("../models/categorySchema");
const Task = require("../models/taskSchema");
const Joi = require("joi");
const Group = require("../models/groupSchema");
const { deleteGroupTasks } = require("../functions/deleteGroupTasks");
const { deleteGroups } = require("../functions/deleteGroups");
const { editGroups } = require("../functions/editGroups");
const {
  createGroupFunction,
  groupSchema,
} = require("../functions/createGroupFunction");
const CustomError = require("../models/CustomError");

const categorySchema = Joi.object({
  title: Joi.string().required(),
  color: Joi.string().required(),
  repeats: Joi.boolean().required(),
  priority: Joi.number().integer().required(),
  goal: Joi.object()
    .when("repeats", {
      is: true,
      then: Joi.optional(),
      otherwise: Joi.forbidden(),
    })
    .keys({
      type: Joi.string().valid("Streak", "Total completed", "Total number"),
      limit: Joi.string().valid("At most", "Exactly", "At least"),
      number: Joi.number().min(1),
    }),
  repeatRate: Joi.object()
    .when("repeats", {
      is: true,
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    })
    .keys({
      number: Joi.number().integer().min(1),
      bigTimePeriod: Joi.string().valid("Days", "Weeks", "Months", "Years"),
      startingDate: Joi.array().items(Joi.date()),
    }),
  _id: Joi.string(),
});

const getCategories = (req, res) => {
  if (req.user) {
    Category.find({ userId: req.user._id }, (err, categories) => {
      if (categories) {
        return res.status(200).json({ categories });
      }

      return res.status(404).json({ message: "Categories not found." });
    });
  } else {
    res.status(401).send({ message: "Not authorized." });
  }
};

const handleCreateCategory = async (category, groups, userId) => {
  const validatedCategory = categorySchema.validate(category);
  const newGroupIdMap = {};

  if (validatedCategory.error) {
    throw new CustomError(validatedCategory.error, 400);
  }

  let validatedGroups = [];

  if (groups.length) {
    for (const group of groups) {
      const validatedGroup = groupSchema.validate(group);

      if (validatedGroup.error)
        throw new CustomError(validatedGroup.error, 400);

      validatedGroup.value.userId = userId;

      validatedGroups.push(validatedGroup.value);
    }
  }

  try {
    const newCategory = await Category.create({
      ...validatedCategory.value,
      userId: userId,
    });

    let newGroups = [];

    if (validatedGroups.length) {
      for (const group of validatedGroups) {
        const newGroup = await Group.create({
          ...group,
          parent: newCategory._id,
          _id: undefined,
        });

        newGroups.push(newGroup);

        newGroupIdMap[group._id] = newGroup._id;
      }
    }

    return { newCategory, newGroups, newGroupIdMap };
  } catch (error) {
    throw new CustomError(error.message, 500);
  }
};

const createCategory = async (req, res) => {
  if (req.user) {
    const { category, groups } = req.body;

    if (!category)
      return res.status(400).json({ message: "No category provided." });

    try {
      const response = await handleCreateCategory(
        category,
        groups,
        req.user._id,
      );

      return res.status(200).json(response);
    } catch (error) {
      res.status(error.code).send({ message: error.message });
    }
  } else {
    res.status(401).send({ message: "Not authorized." });
  }
};

const deleteCategory = async (req, res) => {
  if (req.user) {
    // The user has 3 choices.
    // They can either delete all the tasks which are children of groups of this category
    // Or keep them
    let { categoryId, deleteTasks } = req.body;

    if (!categoryId)
      return res
        .status(400)
        .json({ message: "You have to provide a categoryId." });
    if (deleteTasks === undefined || deleteTasks === null) deleteTasks = false;

    // Delete category
    try {
      const category = await Category.findOne({
        userId: req.user._id,
        _id: categoryId,
      });
      const groups = await Group.find({
        userId: req.user._id,
        parent: categoryId,
      });

      await Category.deleteOne({
        userId: req.user._id,
        _id: categoryId,
      });
      await Group.deleteMany({
        userId: req.user._id,
        parent: categoryId,
      });

      if (deleteTasks) {
        await deleteGroupTasks(req.user._id, categoryId);
      } else {
        const categoryTasks = await Task.find({
          userId: req.user._id,
          category: categoryId,
        });

        for (const task of categoryTasks) {
          const taskGroup = task?.group
            ? groups.find((group) => group._id === task.group)
            : null;
          let repeatRate = category?.repeatRate;

          if (taskGroup) {
            repeatRate = { ...repeatRate, ...taskGroup?.repeatRate };
          }

          await Task.findOneAndUpdate(
            { userId: req.user._id, category: categoryId },
            {
              $set: {
                group: null,
                category: null,
                repeatRate: repeatRate,
                longGoal: category?.goal,
              },
            },
            {},
          );
        }
      }
    } catch (error) {
      return res.status(400).json({ message: error });
    }

    return res.status(200).json({ categoryId });
  } else {
    res.status(401).send({ message: "Not authorized." });
  }
};

const setCategory = async (req, res) => {
  if (req.user) {
    const {
      category,
      groupsForDeletion,
      groupsForEdit,
      action,
      newGroups,
      parentId,
    } = req.body;
    const responseObject = {};

    // For category
    if (category) {
      // Manual validation of _id
      if (!category?._id)
        return res.status(400).json({ message: "Category must have _id." });

      // Store the id of the category individually and delete it
      const categoryId = category._id;
      delete category._id;

      const validatedCategory = categorySchema.validate(category);

      if (validatedCategory.error) {
        return res.status(400).json({ message: validatedCategory.error });
      }
      try {
        responseObject.editedCategory = await Category.findOneAndReplace(
          {
            userId: req.user._id,
            _id: categoryId,
          },
          {
            ...validatedCategory.value,
            userId: req.user._id,
          },
          { new: true },
        );
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }
    }

    // For group deletion
    if (groupsForDeletion?.length > 0) {
      const groupDeleteResponse = await deleteGroups(
        action,
        groupsForDeletion,
        req.user._id,
      );

      if (groupDeleteResponse?.isError) {
        return res.status(500).send({ message: groupDeleteResponse.message });
      } else {
        responseObject.affectedTasks = groupDeleteResponse.affectedTasks;
      }
    }

    // For group editing
    if (groupsForEdit?.length > 0) {
      const groupEditResponse = await editGroups(groupsForEdit, req.user._id);

      if (groupEditResponse?.message) {
        return res.status(500).send({ message: groupEditResponse.message });
      } else {
        responseObject.editedGroups = groupEditResponse.editedGroups;
      }
    }

    // For new groups
    if (newGroups?.length > 0) {
      if (!parentId)
        return res
          .status(400)
          .send({ message: "parentId required for adding new groups" });

      const newGroupList = [];

      for (const newGroup of newGroups) {
        const createGroupResponse = await createGroupFunction(
          newGroup,
          req.user._id,
          parentId,
        );

        if (createGroupResponse?.message) {
          return res.status(500).send({ message: createGroupResponse.message });
        } else {
          newGroupList.push(createGroupResponse.newGroup);
        }
      }

      if (newGroupList.length > 0) {
        responseObject.newGroups = newGroupList;
      }
    }

    // Return all changes made
    return res.status(200).send(responseObject);
  } else {
    res.status(401).send({ message: "Not authorized." });
  }
};

module.exports = {
  getCategories,
  createCategory,
  deleteCategory,
  setCategory,
  categorySchema,
  handleCreateCategory,
};
