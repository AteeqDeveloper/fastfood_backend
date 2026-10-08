const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    review: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 5,
    },
    is_approved: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Map _id to id for frontend compatibility
reviewSchema.virtual('id').get(function () {
  return this._id.toString();
});

module.exports = mongoose.model('Review', reviewSchema);
