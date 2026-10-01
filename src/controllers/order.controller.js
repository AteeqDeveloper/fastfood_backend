const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const orderService = require('../services/order.service');
const ApiResponse = require('../utils/apiResponse');
const { getPagination, buildPagination } = require('../utils/pagination');

const placeOrder = async (req, res, next) => {
  try {
    const order = await orderService.placeOrder(req.user._id, req.body);
    return ApiResponse.created(res, 'Order placed successfully', order);
  } catch (error) { next(error); }
};

const getMyOrders = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const filter = { user: req.user._id };
    if (req.query.status) filter.orderStatus = req.query.status;
    const [orders, total] = await Promise.all([
      Order.find(filter).populate('restaurant', 'name image city').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);
    return ApiResponse.success(res, 'Orders fetched successfully', orders, 200, buildPagination(page, limit, total));
  } catch (error) { next(error); }
};

const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('restaurant', 'name phone address city')
      .populate('user', 'name email phone');
    if (!order) return ApiResponse.error(res, 'Order not found', 404);
    const isOwner = order.user._id.toString() === req.user._id.toString();
    const isSuperAdmin = req.user.role === 'super_admin';
    let isRestaurantAdmin = false;
    if (req.user.role === 'restaurant_admin') {
      const restaurant = await Restaurant.findById(order.restaurant._id || order.restaurant);
      isRestaurantAdmin = restaurant && restaurant.owner.toString() === req.user._id.toString();
    }
    if (!isOwner && !isSuperAdmin && !isRestaurantAdmin) {
      return ApiResponse.error(res, 'You do not have access to this order', 403);
    }
    return ApiResponse.success(res, 'Order fetched successfully', order);
  } catch (error) { next(error); }
};

const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return ApiResponse.error(res, 'Order not found', 404);
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'super_admin') {
      return ApiResponse.error(res, 'You can only cancel your own orders', 403);
    }
    if (!['pending', 'confirmed'].includes(order.orderStatus)) {
      return ApiResponse.error(res, `Cannot cancel order in "${order.orderStatus}" status`, 400);
    }
    order.orderStatus = 'cancelled';
    await order.save();
    return ApiResponse.success(res, 'Order cancelled successfully', order);
  } catch (error) { next(error); }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return ApiResponse.error(res, 'Order not found', 404);
    if (req.user.role !== 'super_admin') {
      const restaurant = await Restaurant.findById(order.restaurant);
      if (!restaurant || restaurant.owner.toString() !== req.user._id.toString()) {
        return ApiResponse.error(res, 'You can only update orders for your restaurant', 403);
      }
    }
    const newStatus = req.body.status;
    if (!Order.canTransition(order.orderStatus, newStatus)) {
      const allowed = Order.getValidTransitions(order.orderStatus);
      return ApiResponse.error(res, `Invalid status transition from "${order.orderStatus}" to "${newStatus}". Allowed: ${allowed.join(', ') || 'none'}`, 400);
    }
    order.orderStatus = newStatus;
    if (newStatus === 'delivered' && order.paymentMethod === 'cash') {
      order.paymentStatus = 'paid';
    }
    await order.save();
    return ApiResponse.success(res, 'Order status updated successfully', order);
  } catch (error) { next(error); }
};

const getRestaurantOrders = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) return ApiResponse.error(res, 'Restaurant not found', 404);
    if (req.user.role !== 'super_admin' && restaurant.owner.toString() !== req.user._id.toString()) {
      return ApiResponse.error(res, 'Access denied', 403);
    }
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const filter = { restaurant: restaurant._id };
    if (req.query.status) filter.orderStatus = req.query.status;
    if (req.query.search) filter.orderNumber = new RegExp(req.query.search, 'i');
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
      if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
    }
    const [orders, total] = await Promise.all([
      Order.find(filter).populate('user', 'name email phone').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);
    return ApiResponse.success(res, 'Restaurant orders fetched successfully', orders, 200, buildPagination(page, limit, total));
  } catch (error) { next(error); }
};

module.exports = { placeOrder, getMyOrders, getOrder, cancelOrder, updateOrderStatus, getRestaurantOrders };
