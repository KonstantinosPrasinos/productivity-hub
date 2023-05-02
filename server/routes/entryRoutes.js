const express = require('express');
const {getRecentEntries, getTaskEntries, setEntryValue, deleteEntry, deleteTaskEntries, getTaskEntryById, addEntry,
    setEntry
} = require('../controllers/entryController');

const router = express.Router();

// router.get('/', getTaskEntries);
router.get('/recent', getRecentEntries);
router.get('/:entryId', getTaskEntryById);
// router.post('/', addTaskEntry);
router.get('/all/:taskId', getTaskEntries)
router.post('/set-value', setEntryValue);
router.post('/set', setEntry);
router.post('/delete-single', deleteEntry);
router.post('/delete-all-task', deleteTaskEntries);
router.post('/create', addEntry);

module.exports = router;