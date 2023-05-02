const express = require('express');
const {getTasks, createTask, deleteTask, setTask, undoDeleteTask} = require('../controllers/taskController');

const router = express.Router();

router.get('/', getTasks);
router.post('/create', createTask);
router.post('/set', setTask);
router.post('/delete', deleteTask);
router.post('/undo-delete', undoDeleteTask);

module.exports = router;