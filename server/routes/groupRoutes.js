const express = require('express');
const {getGroups, createGroup, deleteGroup} = require("../controllers/groupController");

const router = express.Router();

router.get('/', getGroups);
router.post('/create', createGroup);
router.post('/delete', deleteGroup);

module.exports = router;