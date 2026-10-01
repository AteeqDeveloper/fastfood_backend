const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurant.controller');
const categoryController = require('../controllers/category.controller');
const menuController = require('../controllers/menu.controller');
const orderController = require('../controllers/order.controller');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth.middleware');
const { validate, validateObjectId } = require('../middleware/validate.middleware');
const { createRestaurantSchema, updateRestaurantSchema } = require('../validators/restaurant.validator');
const { createCategorySchema } = require('../validators/category.validator');
const { createMenuItemSchema } = require('../validators/menu.validator');

// Public
router.get('/', optionalAuth, restaurantController.listRestaurants);
router.get('/:restaurantId', validateObjectId('restaurantId'), optionalAuth, restaurantController.getRestaurant);
router.get('/:restaurantId/categories', validateObjectId('restaurantId'), optionalAuth, categoryController.listCategories);
router.get('/:restaurantId/menu', validateObjectId('restaurantId'), optionalAuth, menuController.listMenu);

// Auth required - create restaurant (restaurant_admin or customer becoming admin)
router.post('/', authenticate, authorize('restaurant_admin', 'super_admin', 'customer'), validate(createRestaurantSchema), restaurantController.createRestaurant);

// Owner / admin
router.patch('/:restaurantId', authenticate, validateObjectId('restaurantId'), authorize('restaurant_admin', 'super_admin'), validate(updateRestaurantSchema), restaurantController.updateRestaurant);
router.delete('/:restaurantId', authenticate, validateObjectId('restaurantId'), authorize('super_admin'), restaurantController.deleteRestaurant);

// Categories under restaurant
router.post('/:restaurantId/categories', authenticate, validateObjectId('restaurantId'), authorize('restaurant_admin', 'super_admin'), validate(createCategorySchema), categoryController.createCategory);

// Menu under restaurant
router.post('/:restaurantId/menu', authenticate, validateObjectId('restaurantId'), authorize('restaurant_admin', 'super_admin'), validate(createMenuItemSchema), menuController.createMenuItem);

// Restaurant orders
router.get('/:restaurantId/orders', authenticate, validateObjectId('restaurantId'), authorize('restaurant_admin', 'super_admin'), orderController.getRestaurantOrders);

module.exports = router;
