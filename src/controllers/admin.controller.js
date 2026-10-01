const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const ApiResponse = require('../utils/apiResponse');
const { getPagination, buildPagination } = require('../utils/pagination');

const listUsers = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.search) {
      filter.$or = [
        { name: new RegExp(req.query.search, 'i') },
        { email: new RegExp(req.query.search, 'i') },
      ];
    }
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);
    return ApiResponse.success(res, 'Users fetched successfully', users, 200, buildPagination(page, limit, total));
  } catch (error) { next(error); }
};

const listRestaurants = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const filter = {};
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    const [restaurants, total] = await Promise.all([
      Restaurant.find(filter).populate('owner', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Restaurant.countDocuments(filter),
    ]);
    return ApiResponse.success(res, 'Restaurants fetched successfully', restaurants, 200, buildPagination(page, limit, total));
  } catch (error) { next(error); }
};

const listOrders = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const filter = {};
    if (req.query.status) filter.orderStatus = req.query.status;
    const [orders, total] = await Promise.all([
      Order.find(filter).populate('user', 'name email').populate('restaurant', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);
    return ApiResponse.success(res, 'Orders fetched successfully', orders, 200, buildPagination(page, limit, total));
  } catch (error) { next(error); }
};

const getDashboard = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const [totalUsers, totalRestaurants, totalOrders, revenueAgg, todayOrders, pendingOrders, completedOrders] = await Promise.all([
      User.countDocuments(),
      Restaurant.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.aggregate([{ $match: { orderStatus: 'delivered' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.countDocuments({ createdAt: { $gte: todayStart } }),
      Order.countDocuments({ orderStatus: 'pending' }),
      Order.countDocuments({ orderStatus: 'delivered' }),
    ]);
    return ApiResponse.success(res, 'Dashboard statistics', {
      totalUsers, totalRestaurants, totalOrders,
      totalRevenue: revenueAgg[0]?.total || 0,
      todayOrders, pendingOrders, completedOrders,
    });
  } catch (error) { next(error); }
};

const blockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return ApiResponse.error(res, 'User not found', 404);
    if (user.role === 'super_admin') return ApiResponse.error(res, 'Cannot block super admin', 403);
    user.isBlocked = true;
    await user.save();
    return ApiResponse.success(res, 'User blocked successfully', user);
  } catch (error) { next(error); }
};

const unblockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return ApiResponse.error(res, 'User not found', 404);
    user.isBlocked = false;
    await user.save();
    return ApiResponse.success(res, 'User unblocked successfully', user);
  } catch (error) { next(error); }
};

module.exports = { listUsers, listRestaurants, listOrders, getDashboard, blockUser, unblockUser };
