const Category = require('../models/Category');
const Restaurant = require('../models/Restaurant');
const ApiResponse = require('../utils/apiResponse');

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

const listCategories = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) return ApiResponse.error(res, 'Restaurant not found', 404);
    const filter = { restaurant: restaurant._id };
    if (!req.user || req.user.role === 'customer') filter.isActive = true;
    const categories = await Category.find(filter).sort({ sortOrder: 1, name: 1 });
    return ApiResponse.success(res, 'Categories fetched successfully', categories);
  } catch (error) {
    next(error);
  }
};

const getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.categoryId).populate('restaurant', 'name');
    if (!category) return ApiResponse.error(res, 'Category not found', 404);
    return ApiResponse.success(res, 'Category fetched successfully', category);
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    await ensureRestaurantAccess(req.params.restaurantId, req.user);
    const category = await Category.create({ ...req.body, restaurant: req.params.restaurantId });
    return ApiResponse.created(res, 'Category created successfully', category);
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) return ApiResponse.error(res, 'Category not found', 404);
    await ensureRestaurantAccess(category.restaurant, req.user);
    Object.assign(category, req.body);
    await category.save();
    return ApiResponse.success(res, 'Category updated successfully', category);
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) return ApiResponse.error(res, 'Category not found', 404);
    await ensureRestaurantAccess(category.restaurant, req.user);
    category.isActive = false;
    await category.save();
    return ApiResponse.success(res, 'Category deactivated successfully', category);
  } catch (error) {
    next(error);
  }
};

module.exports = { listCategories, getCategory, createCategory, updateCategory, deleteCategory };
