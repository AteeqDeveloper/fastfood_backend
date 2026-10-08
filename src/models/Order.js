const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
    },
    id: mongoose.Schema.Types.Mixed,
    title: { type: String },
    name: { type: String },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    qty: {
      type: Number,
      default: 1,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const deliveryAddressSchema = new mongoose.Schema(
  {
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    postalCode: { type: String, default: '' },
  },
  { _id: false }
);

const VALID_STATUS_TRANSITIONS = {
  pending: ['confirmed', 'cancelled', 'rejected', 'preparing'],
  confirmed: ['preparing', 'cancelled', 'rejected'],
  preparing: ['ready', 'cancelled', 'out_for_delivery', 'delivered'],
  ready: ['out_for_delivery', 'delivered'],
  out_for_delivery: ['delivered'],
  delivered: [],
  cancelled: [],
  rejected: [],
};

const orderSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      index: true,
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customer: {
      type: String,
      default: 'Guest',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: false,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(v) => v.length > 0, 'Order must have at least one item'],
    },
    address: {
      type: String,
      default: '',
    },
    deliveryAddress: {
      type: deliveryAddressSchema,
      required: false,
    },
    phone: {
      type: String,
      default: '',
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
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      default: 'cash',
    },
    paymentStatus: {
      type: String,
      default: 'pending',
    },
    status: {
      type: String,
      default: 'Preparing',
    },
    orderStatus: {
      type: String,
      default: 'preparing',
      index: true,
    },
    notes: {
      type: String,
      default: '',
      maxlength: 500,
    },
  },
  { timestamps: true }
);

orderSchema.statics.canTransition = function (currentStatus, newStatus) {
  const allowed = VALID_STATUS_TRANSITIONS[currentStatus] || [];
  return allowed.includes(newStatus);
};

orderSchema.statics.getValidTransitions = function (currentStatus) {
  return VALID_STATUS_TRANSITIONS[currentStatus] || [];
};

module.exports = mongoose.model('Order', orderSchema);
