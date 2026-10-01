const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');
const Restaurant = require('../models/Restaurant');
const ApiResponse = require('../utils/apiResponse');
const { getPagination, buildPagination } = require('../utils/pagination');

const ensureRestaurantAccess = async (restaurantId, user) => {
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    const err = new Error('Restaurant not found');
    err.statusCode = 404;
    throw err;
  }
  if (user.role !== 'super_admin' && restaurant.owner.toString() !== user._id.toString()) {
    const err = new Error('You do not have permission to manage this restaurant');
    err.statusCode = 403;
    throw err;
  }
  return restaurant;
};

const listMenu = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) return ApiResponse.error(res, 'Restaurant not found', 404);
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const { category, search, minPrice, maxPrice, available } = req.query;
    const filter = { restaurant: restaurant._id };
    if (available !== undefined) filter.isAvailable = available === 'true';
    else if (!req.user || req.user.role === 'customer') filter.isAvailable = true;
    if (category) filter.category = category;
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }
    if (search) filter.$text = { $search: search };
    const [items, total] = await Promise.all([
      MenuItem.find(filter).populate('category', 'name')
        .sort(search ? { score: { $meta: 'textScore' } } : { name: 1 })
        .skip(skip).limit(limit),
      MenuItem.countDocuments(filter),
    ]);
    return ApiResponse.success(res, 'Menu fetched successfully', items, 200, buildPagination(page, limit, total));
  } catch (error) { next(error); }
};

const getMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.menuItemId)
      .populate('category', 'name').populate('restaurant', 'name');
    if (!item) return ApiResponse.error(res, 'Menu item not found', 404);
    return ApiResponse.success(res, 'Menu item fetched successfully', item);
  } catch (error) { next(error); }
};

const createMenuItem = async (req, res, next) => {
  try {
    await ensureRestaurantAccess(req.params.restaurantId, req.user);
    const category = await Category.findOne({ _id: req.body.category, restaurant: req.params.restaurantId });
    if (!category) return ApiResponse.error(res, 'Category not found for this restaurant', 400);
    const item = await MenuItem.create({ ...req.body, restaurant: req.params.restaurantId });
    await item.populate('category', 'name');
    return ApiResponse.created(res, 'Menu item created successfully', item);
  } catch (error) { next(error); }
};

const updateMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.menuItemId);
    if (!item) return ApiResponse.error(res, 'Menu item not found', 404);
    await ensureRestaurantAccess(item.restaurant, req.user);
    if (req.body.category) {
      const category = await Category.findOne({ _id: req.body.category, restaurant: item.restaurant });
      if (!category) return ApiResponse.error(res, 'Category not found for this restaurant', 400);
    }
    Object.assign(item, req.body);
    await item.save();
    await item.populate('category', 'name');
    return ApiResponse.success(res, 'Menu item updated successfully', item);
  } catch (error) { next(error); }
};

const deleteMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.menuItemId);
    if (!item) return ApiResponse.error(res, 'Menu item not found', 404);
    await ensureRestaurantAccess(item.restaurant, req.user);
    item.isAvailable = false;
    await item.save();
    return ApiResponse.success(res, 'Menu item deleted (marked unavailable)', item);
  } catch (error) { next(error); }
};

const updateAvailability = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.menuItemId);
    if (!item) return ApiResponse.error(res, 'Menu item not found', 404);
    await ensureRestaurantAccess(item.restaurant, req.user);
    item.isAvailable = req.body.isAvailable;
    await item.save();
    return ApiResponse.success(res, 'Availability updated successfully', item);
  } catch (error) { next(error); }
};

module.exports = { listMenu, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem, updateAvailability };
