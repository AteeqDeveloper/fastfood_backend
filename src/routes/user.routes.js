const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { updateProfileSchema, changePasswordSchema } = require('../validators/auth.validator');

router.use(authenticate);
router.get('/me', userController.getMe);
router.patch('/me', validate(updateProfileSchema), userController.updateProfile);
router.patch('/change-password', validate(changePasswordSchema), userController.changePassword);

module.exports = router;
