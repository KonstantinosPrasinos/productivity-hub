const express = require('express');
const {getRecentEntries, getTaskEntries, addTaskEntry, setEntryValue, deleteEntry, deleteTaskEntries} = require('../controllers/taskHistoryController');

const router = express.Router();

router.get('/', getTaskEntries);
router.get('/recent', getRecentEntries);
router.post('/', addTaskEntry);
router.post('/set', setEntryValue);
router.post('/delete-single', deleteEntry);
router.post('/delete-all-task', deleteTaskEntries);

module.exports = router;