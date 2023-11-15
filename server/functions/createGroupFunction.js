const Group = require("../models/groupSchema");
const Joi = require("joi");

const groupSchema = Joi.object({
    title: Joi.string().required(),
    priority: Joi.number().required(),
    goal: Joi.object().keys({
        type: Joi.string().valid('Streak', 'Total'),
        limit: Joi.string().valid('At most', 'Exactly', 'At least'),
        number: Joi.number().min(1)
    }),
    repeatRate: Joi.object().keys({
        number: Joi.number().integer().min(1),
        bigTimePeriod: Joi.string().valid('Days', 'Weeks', 'Months', 'Years'),
        smallTimePeriod: Joi.array().items(Joi.string()),
        startingDate: Joi.array().items(Joi.date()),
        time: Joi.object().keys({
            start: Joi.string(),
            end: Joi.string()
        })
    }),
});

async function createGroupFunction(group, userId, parentId) {
    const validatedGroup = groupSchema.validate(group);

    if (validatedGroup.error) {
        return {message: validatedGroup.error}
    }

    try {
        const newGroup = await Group.create({
            ...validatedGroup.value,
            userId,
            parent: parentId
        });
        return {newGroup};
    } catch (error) {
        return {message: error.message};
    }
}

module.exports = {createGroupFunction, groupSchema}