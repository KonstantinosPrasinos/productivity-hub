const Group = require('../models/groupSchema');
const {deleteGroups} = require("../functions/deleteGroups");
const {editGroups} = require("../functions/editGroups");
const {createGroupFunction} = require("../functions/createGroupFunction");

const getGroups = async (req, res) => {
    if (req.user) {
        Group.find({userId: req.user._id}, (err, groups) => {
            if (groups) {
                return res.status(200).json({groups})
            }

            return res.status(404).json({message: 'Groups not found.'});
        });
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

const createGroup = async (req, res) => {
    if (req.user) {
        const {group} = req.body;

        // This probably doesn't work but the route is a placeholder so it's fine (?)
        const createGroupResponse = await createGroupFunction(group);

        if (createGroupResponse?.message) {
            res.status(500).send({message: createGroupResponse.message});
        } else {
            res.status(200).send({newGroup: createGroupResponse.newGroup});
        }
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

const deleteGroup = async (req, res) => {
    if (req.user) {
        const {groupIds, action} = req.body;

        const responseObject = await deleteGroups(action, groupIds);

        if (responseObject?.isError) {
            res.status(500).send({message: responseObject.message});
        } else {
            res.status(200).send({message: responseObject.message});
        }
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

const setGroups = async (req, res) => {
    if (req.user) {
        const {groups} = req.body;

        const editGroupsResponse = await editGroups(groups);

        if (editGroupsResponse?.message) {
            res.status(500).json({message: editGroupsResponse.message})
        } else {
            return res.status(200).json({newGroups: editGroupsResponse.editedGroups});
        }
    } else {
        res.status(401).send({message: "Not authorized."});
    }
}

module.exports = {getGroups, createGroup, deleteGroup, setGroups};