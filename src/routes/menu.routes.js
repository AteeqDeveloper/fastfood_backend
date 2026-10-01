const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate, validateObjectId } = require('../middleware/validate.middleware');
const { updateMenuItemSchema, availabilitySchema } = require('../validators/menu.validator');

router.get('/:menuItemId', validateObjectId('menuItemId'), menuController.getMenuItem);
router.patch('/:menuItemId', authenticate, validateObjectId('menuItemId'), authorize('restaurant_admin', 'super_admin'), validate(updateMenuItemSchema), menuController.updateMenuItem);
router.delete('/:menuItemId', authenticate, validateObjectId('menuItemId'), authorize('restaurant_admin', 'super_admin'), menuController.deleteMenuItem);
router.patch('/:menuItemId/availability', authenticate, validateObjectId('menuItemId'), authorize('restaurant_admin', 'super_admin'), validate(availabilitySchema), menuController.updateAvailability);

module.exports = router;
