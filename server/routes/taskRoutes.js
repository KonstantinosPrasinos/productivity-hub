const express = require('express');
const {getTasks, createTask, deleteTask, setTask} = require('../controllers/taskController');

const router = express.Router();

router.get('/', getTasks);
router.post('/create', createTask);
router.post('/set', setTask);
router.post('/delete', deleteTask);

module.exports = router;