const express = require('express');
const {getSettings} = require('../controllers/settingsController');

const router = express.Router();

router.get('/', getSettings);

module.exports = router;