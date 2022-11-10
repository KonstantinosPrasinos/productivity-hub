const express = require('express');
const {getTasks, createTask} = require('../controllers/taskController');

const router = express.Router();

router.get('/', getTasks);
router.post('/create', createTask);

module.exports = router;