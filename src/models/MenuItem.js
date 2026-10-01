const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Menu item name is required'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountPrice: {
      type: Number,
      min: 0,
      default: null,
    },
    image: {
      type: String,
      default: '',
    },
    ingredients: {
      type: [String],
      default: [],
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    preparationTime: {
      type: Number,
      default: 15,
      min: 0,
    },
  },
  { timestamps: true }
);

menuItemSchema.index({ name: 'text', description: 'text' });
menuItemSchema.index({ restaurant: 1, category: 1 });
menuItemSchema.index({ price: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);
