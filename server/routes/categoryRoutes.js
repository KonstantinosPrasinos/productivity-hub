const express = require('express');
const {getCategories, createCategory, deleteCategory} = require('../controllers/categoryController');

const router = express.Router();

router.get('/', getCategories);
router.post('/create', createCategory);
router.post('/delete', deleteCategory);

module.exports = router;