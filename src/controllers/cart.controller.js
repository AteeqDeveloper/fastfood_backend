const cartService = require('../services/cart.service');
const ApiResponse = require('../utils/apiResponse');

const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getOrCreateCart(req.user._id);
    return ApiResponse.success(res, 'Cart fetched successfully', cart);
  } catch (error) { next(error); }
};

const addItem = async (req, res, next) => {
  try {
    const { menuItemId, quantity } = req.body;
    const cart = await cartService.addItem(req.user._id, menuItemId, quantity || 1);
    return ApiResponse.success(res, 'Item added to cart', cart);
  } catch (error) { next(error); }
};

const updateItem = async (req, res, next) => {
  try {
    const cart = await cartService.updateItemQuantity(req.user._id, req.params.menuItemId, req.body.quantity);
    return ApiResponse.success(res, 'Cart item updated', cart);
  } catch (error) { next(error); }
};

const removeItem = async (req, res, next) => {
  try {
    const cart = await cartService.removeItem(req.user._id, req.params.menuItemId);
    return ApiResponse.success(res, 'Item removed from cart', cart);
  } catch (error) { next(error); }
};

const clearCart = async (req, res, next) => {
  try {
    const cart = await cartService.clearCart(req.user._id);
    return ApiResponse.success(res, 'Cart cleared', cart);
  } catch (error) { next(error); }
};

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
