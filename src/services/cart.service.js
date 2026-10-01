const Cart = require('../models/Cart');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const { defaultDeliveryFee } = require('../config/env');

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate({
    path: 'items.menuItem',
    select: 'name price discountPrice image isAvailable restaurant',
  });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

const getEffectivePrice = (menuItem) => {
  if (menuItem.discountPrice != null && menuItem.discountPrice < menuItem.price) {
    return menuItem.discountPrice;
  }
  return menuItem.price;
};

const addItem = async (userId, menuItemId, quantity = 1) => {
  const menuItem = await MenuItem.findById(menuItemId);
  if (!menuItem) {
    const error = new Error('Menu item not found');
    error.statusCode = 404;
    throw error;
  }
  if (!menuItem.isAvailable) {
    const error = new Error('Menu item is currently unavailable');
    error.statusCode = 400;
    throw error;
  }

  const restaurant = await Restaurant.findById(menuItem.restaurant);
  if (!restaurant || !restaurant.isActive) {
    const error = new Error('Restaurant is not active');
    error.statusCode = 400;
    throw error;
  }

  const cart = await getOrCreateCart(userId);

  // Single restaurant rule
  if (cart.restaurant && cart.restaurant.toString() !== menuItem.restaurant.toString()) {
    const error = new Error(
      'Cart contains items from another restaurant. Clear cart first or finish current order.'
    );
    error.statusCode = 400;
    throw error;
  }

  if (!cart.restaurant) {
    cart.restaurant = menuItem.restaurant;
  }

  const price = getEffectivePrice(menuItem);
  const existingIndex = cart.items.findIndex(
    (i) => i.menuItem.toString() === menuItemId.toString()
  );

  if (existingIndex > -1) {
    cart.items[existingIndex].quantity += quantity;
    cart.items[existingIndex].price = price; // refresh price
  } else {
    cart.items.push({
      menuItem: menuItemId,
      quantity,
      price,
    });
  }

  cart.recalculateTotals(defaultDeliveryFee);
  await cart.save();

  return getOrCreateCart(userId);
};

const updateItemQuantity = async (userId, menuItemId, quantity) => {
  const cart = await getOrCreateCart(userId);
  const index = cart.items.findIndex((i) => i.menuItem.toString() === menuItemId.toString());
  if (index === -1) {
    const error = new Error('Item not found in cart');
    error.statusCode = 404;
    throw error;
  }

  // Refresh price from DB
  const menuItem = await MenuItem.findById(menuItemId);
  if (!menuItem || !menuItem.isAvailable) {
    cart.items.splice(index, 1);
    if (cart.items.length === 0) cart.restaurant = null;
    cart.recalculateTotals(defaultDeliveryFee);
    await cart.save();
    const error = new Error('Menu item is no longer available and was removed from cart');
    error.statusCode = 400;
    throw error;
  }

  cart.items[index].quantity = quantity;
  cart.items[index].price = getEffectivePrice(menuItem);
  cart.recalculateTotals(defaultDeliveryFee);
  await cart.save();
  return getOrCreateCart(userId);
};

const removeItem = async (userId, menuItemId) => {
  const cart = await getOrCreateCart(userId);
  const index = cart.items.findIndex((i) => i.menuItem.toString() === menuItemId.toString());
  if (index === -1) {
    const error = new Error('Item not found in cart');
    error.statusCode = 404;
    throw error;
  }
  cart.items.splice(index, 1);
  if (cart.items.length === 0) {
    cart.restaurant = null;
    cart.discount = 0;
  }
  cart.recalculateTotals(defaultDeliveryFee);
  await cart.save();
  return getOrCreateCart(userId);
};

const clearCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  cart.items = [];
  cart.restaurant = null;
  cart.subtotal = 0;
  cart.deliveryFee = 0;
  cart.discount = 0;
  cart.total = 0;
  await cart.save();
  return cart;
};

module.exports = {
  getOrCreateCart,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart,
  getEffectivePrice,
};
