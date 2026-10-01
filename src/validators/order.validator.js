const Joi = require('joi');

const placeOrderSchema = Joi.object({
  deliveryAddress: Joi.object({
    address: Joi.string().trim().min(5).required(),
    city: Joi.string().trim().min(2).required(),
    postalCode: Joi.string().trim().allow('').optional(),
  }).required(),
  phone: Joi.string().trim().min(10).required(),
  paymentMethod: Joi.string().valid('cash', 'card', 'online').default('cash'),
  notes: Joi.string().trim().max(500).allow('').optional(),
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      'pending',
      'confirmed',
      'preparing',
      'ready',
      'out_for_delivery',
      'delivered',
      'cancelled',
      'rejected'
    )
    .required(),
});

const cartItemSchema = Joi.object({
  menuItemId: Joi.string().hex().length(24).required(),
  quantity: Joi.number().integer().min(1).default(1),
});

const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required(),
});

module.exports = {
  placeOrderSchema,
  updateOrderStatusSchema,
  cartItemSchema,
  updateCartItemSchema,
};
