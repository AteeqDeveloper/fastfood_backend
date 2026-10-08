const express = require('express');
const router = express.Router();
const dealController = require('../controllers/deal.controller');

router.get('/', dealController.listDeals);
router.post('/', dealController.saveDeal);
router.patch('/:id', dealController.updateDeal);
router.delete('/:id', dealController.deleteDeal);

module.exports = router;
