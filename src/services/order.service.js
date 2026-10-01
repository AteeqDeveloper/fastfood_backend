const Order = require('../models/Order');
const Cart = require('../models/Cart');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const generateOrderNumber = require('../utils/generateOrderNumber');
const { defaultDeliveryFee } = require('../config/env');
const cartService = require('./cart.service');

const placeOrder = async (userId, orderData) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart || !cart.items || cart.items.length === 0) {
    const error = new Error('Cart is empty');
    error.statusCode = 400;
    throw error;
  }

  const restaurant = await Restaurant.findById(cart.restaurant);
  if (!restaurant || !restaurant.isActive) {
    const error = new Error('Restaurant is not active or no longer available');
    error.statusCode = 400;
    throw error;
  }

  // Re-validate every item from database
  const orderItems = [];
  let subtotal = 0;

  for (const cartItem of cart.items) {
    const menuItem = await MenuItem.findById(cartItem.menuItem);
    if (!menuItem) {
      const error = new Error(`Menu item no longer exists`);
      error.statusCode = 400;
      throw error;
    }
    if (!menuItem.isAvailable) {
      const error = new Error(`"${menuItem.name}" is currently unavailable`);
      error.statusCode = 400;
      throw error;
    }
    if (menuItem.restaurant.toString() !== cart.restaurant.toString()) {
      const error = new Error('Cart contains items from mismatched restaurants');
      error.statusCode = 400;
      throw error;
    }

    const price = cartService.getEffectivePrice(menuItem);
    const itemSubtotal = price * cartItem.quantity;
    subtotal += itemSubtotal;

    orderItems.push({
      menuItem: menuItem._id,
      name: menuItem.name,
      price,
      quantity: cartItem.quantity,
      subtotal: itemSubtotal,
    });
  }

  const deliveryFee = defaultDeliveryFee;
  const discount = cart.discount || 0;
  const total = Math.max(0, subtotal + deliveryFee - discount);

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    user: userId,
    restaurant: cart.restaurant,
    items: orderItems,
    deliveryAddress: orderData.deliveryAddress,
    phone: orderData.phone,
    subtotal,
    deliveryFee,
    discount,
    total,
    paymentMethod: orderData.paymentMethod || 'cash',
    paymentStatus: 'pending',
    orderStatus: 'pending',
    notes: orderData.notes || '',
  });

  // Clear cart
  await cartService.clearCart(userId);

  return Order.findById(order._id)
    .populate('restaurant', 'name phone address city')
    .populate('user', 'name email phone');
};

module.exports = { placeOrder };
