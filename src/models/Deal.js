const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    tagline: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    detailedDescription: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    items: {
      type: [String],
      default: [],
    },
    productIds: {
      type: [Number],
      default: [],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    discountPercent: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      default: 'Solo Combos',
    },
    startDate: {
      type: String,
      default: '',
    },
    expiryDate: {
      type: String,
      default: '',
    },
    validity: {
      type: String,
      default: '',
    },
    badge: {
      type: String,
      default: '',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isLimitedTime: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 4.9,
    },
    ordersCount: {
      type: String,
      default: '100+',
    },
    status: {
      type: String,
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Deal', dealSchema);
