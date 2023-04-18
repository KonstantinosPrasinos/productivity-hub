const express = require('express');
const {getCategories, createCategory, deleteCategory, setCategory} = require('../controllers/categoryController');

const router = express.Router();

router.get('/', getCategories);
router.post('/create', createCategory);
router.post('/delete', deleteCategory);
router.post('/set', setCategory);

module.exports = router;