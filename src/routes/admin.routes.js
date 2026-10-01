const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validateObjectId } = require('../middleware/validate.middleware');

router.use(authenticate);
router.use(authorize('super_admin'));

router.get('/users', adminController.listUsers);
router.get('/restaurants', adminController.listRestaurants);
router.get('/orders', adminController.listOrders);
router.get('/dashboard', adminController.getDashboard);
router.patch('/users/:userId/block', validateObjectId('userId'), adminController.blockUser);
router.patch('/users/:userId/unblock', validateObjectId('userId'), adminController.unblockUser);

module.exports = router;
