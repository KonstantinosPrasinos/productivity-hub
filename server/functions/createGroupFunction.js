const Group = require("../models/groupSchema");
const Joi = require("joi");

const groupSchema = Joi.object({
  title: Joi.string().required(),
  repeatRate: Joi.object().keys({
    smallTimePeriod: Joi.array().items(Joi.string()),
    startingDate: Joi.array().items(Joi.date()),
    time: Joi.object().keys({
      start: Joi.string(),
      end: Joi.string(),
    }),
  }),
  parent: Joi.string(),
  _id: Joi.number(),
});

async function createGroupFunction(group, userId, parentId) {
  const validatedGroup = groupSchema.validate(group);

  if (validatedGroup.error) {
    return { message: validatedGroup.error };
  }

  try {
    const newGroup = await Group.create({
      ...validatedGroup.value,
      userId,
      parent: parentId,
    });
    return { newGroup };
  } catch (error) {
    return { message: error.message };
  }
}

module.exports = { createGroupFunction, groupSchema };
