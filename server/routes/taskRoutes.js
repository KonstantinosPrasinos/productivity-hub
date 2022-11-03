const express = require('express');
const {getTasks} = require('../controllers/taskController');

const router = express.Router();

router.get('/', getTasks);

module.exports = router;