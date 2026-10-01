const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate, validateObjectId } = require('../middleware/validate.middleware');
const { updateCategorySchema } = require('../validators/category.validator');

router.get('/:categoryId', validateObjectId('categoryId'), categoryController.getCategory);
router.patch('/:categoryId', authenticate, validateObjectId('categoryId'), authorize('restaurant_admin', 'super_admin'), validate(updateCategorySchema), categoryController.updateCategory);
router.delete('/:categoryId', authenticate, validateObjectId('categoryId'), authorize('restaurant_admin', 'super_admin'), categoryController.deleteCategory);

module.exports = router;
