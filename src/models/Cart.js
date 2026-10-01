const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      default: null,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

cartSchema.methods.recalculateTotals = function (deliveryFee = 0) {
  this.subtotal = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  this.deliveryFee = this.items.length > 0 ? deliveryFee : 0;
  this.total = Math.max(0, this.subtotal + this.deliveryFee - this.discount);
};

module.exports = mongoose.model('Cart', cartSchema);
