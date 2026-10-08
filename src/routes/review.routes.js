const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');

router.get('/', reviewController.listReviews);
router.post('/', reviewController.createReview);
router.patch('/:id', reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);

module.exports = router;
