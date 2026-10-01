const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate, validateObjectId } = require('../middleware/validate.middleware');
const { cartItemSchema, updateCartItemSchema } = require('../validators/order.validator');

router.use(authenticate);
router.use(authorize('customer', 'restaurant_admin', 'super_admin'));

router.get('/', cartController.getCart);
router.post('/items', validate(cartItemSchema), cartController.addItem);
router.patch('/items/:menuItemId', validateObjectId('menuItemId'), validate(updateCartItemSchema), cartController.updateItem);
router.delete('/items/:menuItemId', validateObjectId('menuItemId'), cartController.removeItem);
router.delete('/', cartController.clearCart);

module.exports = router;
