const Review = require('../models/Review');
const ApiResponse = require('../utils/apiResponse');

const listReviews = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.product_id !== undefined) {
      filter.product_id = req.query.product_id;
    }
    if (req.query.is_approved !== undefined) {
      filter.is_approved = req.query.is_approved === 'true';
    }

    const reviews = await Review.find(filter).sort({ createdAt: -1 });
    const formatted = reviews.map((r) => ({
      id: r._id.toString(),
      _id: r._id,
      product_id: r.product_id,
      username: r.username,
      review: r.review,
      rating: r.rating,
      is_approved: r.is_approved,
      createdAt: r.createdAt,
      created_at: r.createdAt,
    }));

    return ApiResponse.success(res, 'Reviews fetched successfully', formatted);
  } catch (error) {
    next(error);
  }
};

const createReview = async (req, res, next) => {
  try {
    const { product_id, username, review, rating } = req.body;
    if (!product_id || !username || !review) {
      return ApiResponse.error(res, 'product_id, username, and review are required', 400);
    }

    const newReview = await Review.create({
      product_id,
      username: username.trim(),
      review: review.trim(),
      rating: Number(rating) || 5,
      is_approved: false,
    });

    const formatted = {
      id: newReview._id.toString(),
      _id: newReview._id,
      product_id: newReview.product_id,
      username: newReview.username,
      review: newReview.review,
      rating: newReview.rating,
      is_approved: newReview.is_approved,
      createdAt: newReview.createdAt,
      created_at: newReview.createdAt,
    };

    return ApiResponse.created(res, 'Review submitted for moderation', formatted);
  } catch (error) {
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!review) return ApiResponse.error(res, 'Review not found', 404);

    const formatted = {
      id: review._id.toString(),
      _id: review._id,
      product_id: review.product_id,
      username: review.username,
      review: review.review,
      rating: review.rating,
      is_approved: review.is_approved,
      createdAt: review.createdAt,
      created_at: review.createdAt,
    };

    return ApiResponse.success(res, 'Review updated successfully', formatted);
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return ApiResponse.error(res, 'Review not found', 404);
    return ApiResponse.success(res, 'Review deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { listReviews, createReview, updateReview, deleteReview };
