const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate, validateObjectId } = require('../middleware/validate.middleware');
const { placeOrderSchema, updateOrderStatusSchema } = require('../validators/order.validator');

// Public storefront routes
router.post('/place', orderController.placeStorefrontOrder);
router.get('/track', orderController.trackOrder);
router.get('/admin', orderController.listAllOrdersAdmin);
router.patch('/:orderId/status', orderController.updateOrderStatusFlex);

router.use(authenticate);

router.post('/', authorize('customer', 'restaurant_admin', 'super_admin'), validate(placeOrderSchema), orderController.placeOrder);
router.get('/my-orders', orderController.getMyOrders);
router.get('/:orderId', validateObjectId('orderId'), orderController.getOrder);
router.patch('/:orderId/cancel', validateObjectId('orderId'), orderController.cancelOrder);

module.exports = router;
