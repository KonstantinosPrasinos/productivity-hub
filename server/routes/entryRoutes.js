const express = require('express');
const {getRecentEntries, getTaskEntries, addTaskEntry, setEntryValue, deleteEntry, deleteTaskEntries, getTaskEntryById} = require('../controllers/entryController');

const router = express.Router();

// router.get('/', getTaskEntries);
router.get('/recent', getRecentEntries);
router.get('/:entryId', getTaskEntryById);
router.post('/', addTaskEntry);
router.get('/all/:taskId', getTaskEntries)
router.post('/set', setEntryValue);
router.post('/delete-single', deleteEntry);
router.post('/delete-all-task', deleteTaskEntries);

module.exports = router;