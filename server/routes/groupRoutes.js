const express = require('express');
const {getGroups, createGroup, deleteGroup, setGroups} = require("../controllers/groupController");

const router = express.Router();

router.get('/', getGroups);
router.post('/create', createGroup);
router.post('/delete', deleteGroup);
router.post('/set', setGroups)

module.exports = router;