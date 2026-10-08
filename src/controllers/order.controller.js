const mongoose = require('mongoose');
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

const placeStorefrontOrder = async (req, res, next) => {
  try {
    const { id, customer, phone, address, items, total, status } = req.body;
    const orderNumber = id || `SB-${Date.now().toString().slice(-6)}`;

    const formattedItems = (items || []).map((i) => ({
      id: i.id,
      title: i.title || i.name || 'Item',
      name: i.title || i.name || 'Item',
      price: Number(i.price) || 0,
      qty: Number(i.qty || i.quantity || 1),
      quantity: Number(i.qty || i.quantity || 1),
      subtotal: (Number(i.price) || 0) * Number(i.qty || i.quantity || 1),
    }));

    const defaultRestaurant = await Restaurant.findOne();

    const newOrder = await Order.create({
      id: orderNumber,
      orderNumber,
      customer: customer || 'Guest',
      phone: phone || '',
      address: address || '',
      items: formattedItems,
      total: Number(total) || 0,
      subtotal: Number(total) || 0,
      status: status || 'Preparing',
      orderStatus: (status || 'preparing').toLowerCase().replace(/\s+/g, '_'),
      restaurant: defaultRestaurant?._id,
    });

    const returnedOrder = {
      id: newOrder.id || newOrder.orderNumber,
      orderNumber: newOrder.orderNumber,
      customer: newOrder.customer,
      phone: newOrder.phone,
      address: newOrder.address,
      items: newOrder.items,
      total: newOrder.total,
      status: newOrder.status,
      created_at: newOrder.createdAt,
      createdAt: newOrder.createdAt,
    };

    return ApiResponse.created(res, 'Order placed successfully', returnedOrder);
  } catch (error) {
    next(error);
  }
};

const trackOrder = async (req, res, next) => {
  try {
    const raw = req.query.query || req.query.id || req.query.phone || '';
    const trimmed = raw.trim();
    if (!trimmed) {
      return ApiResponse.success(res, 'No query provided', []);
    }

    const regex = new RegExp(`^${trimmed}$`, 'i');
    const orders = await Order.find({
      $or: [
        { id: regex },
        { orderNumber: regex },
        { phone: trimmed },
      ],
    }).sort({ createdAt: -1 });

    const formatted = orders.map((o) => ({
      id: o.id || o.orderNumber,
      orderNumber: o.orderNumber,
      customer: o.customer || (o.user?.name) || 'Guest',
      phone: o.phone,
      address: o.address || o.deliveryAddress?.address || '',
      items: o.items.map((i) => ({
        id: i.id || i.menuItem,
        title: i.title || i.name,
        price: i.price,
        qty: i.qty || i.quantity || 1,
      })),
      total: o.total,
      status: o.status || o.orderStatus,
      created_at: o.createdAt,
      createdAt: o.createdAt,
    }));

    return ApiResponse.success(res, 'Orders fetched successfully', formatted);
  } catch (error) {
    next(error);
  }
};

const listAllOrdersAdmin = async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    const formatted = orders.map((o) => ({
      id: o.id || o.orderNumber,
      _id: o._id,
      orderNumber: o.orderNumber,
      customer: o.customer || (o.user?.name) || 'Guest',
      phone: o.phone,
      address: o.address || o.deliveryAddress?.address || '',
      items: o.items.map((i) => ({
        id: i.id || i.menuItem,
        title: i.title || i.name,
        price: i.price,
        qty: i.qty || i.quantity || 1,
      })),
      total: o.total,
      status: o.status || o.orderStatus,
      created_at: o.createdAt,
      createdAt: o.createdAt,
    }));

    return ApiResponse.success(res, 'All orders fetched successfully', formatted);
  } catch (error) {
    next(error);
  }
};

const updateOrderStatusFlex = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const filter = mongoose.Types.ObjectId.isValid(orderId)
      ? { $or: [{ _id: orderId }, { id: orderId }, { orderNumber: orderId }] }
      : { $or: [{ id: orderId }, { orderNumber: orderId }] };

    const order = await Order.findOne(filter);
    if (!order) return ApiResponse.error(res, 'Order not found', 404);

    order.status = status;
    order.orderStatus = status.toLowerCase().replace(/\s+/g, '_');
    await order.save();

    return ApiResponse.success(res, 'Order status updated successfully', {
      id: order.id || order.orderNumber,
      status: order.status,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getOrder,
  cancelOrder,
  updateOrderStatus,
  getRestaurantOrders,
  placeStorefrontOrder,
  trackOrder,
  listAllOrdersAdmin,
  updateOrderStatusFlex,
};
