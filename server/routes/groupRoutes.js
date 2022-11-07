const express = require('express');
const {getGroups} = require("../controllers/groupController");

const router = express.Router();

router.get('/', getGroups);

module.exports = router;