const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate, validateObjectId } = require('../middleware/validate.middleware');
const { placeOrderSchema, updateOrderStatusSchema } = require('../validators/order.validator');

router.use(authenticate);

router.post('/', authorize('customer', 'restaurant_admin', 'super_admin'), validate(placeOrderSchema), orderController.placeOrder);
router.get('/my-orders', orderController.getMyOrders);
router.get('/:orderId', validateObjectId('orderId'), orderController.getOrder);
router.patch('/:orderId/cancel', validateObjectId('orderId'), orderController.cancelOrder);
router.patch('/:orderId/status', validateObjectId('orderId'), authorize('restaurant_admin', 'super_admin'), validate(updateOrderStatusSchema), orderController.updateOrderStatus);

module.exports = router;
