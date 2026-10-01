const Restaurant = require('../models/Restaurant');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const ApiResponse = require('../utils/apiResponse');
const { getPagination, buildPagination } = require('../utils/pagination');

const listRestaurants = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const { search, city, isActive, isOpen } = req.query;

    const filter = {};
    // Public sees only active by default
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    } else if (!req.user || req.user.role === 'customer') {
      filter.isActive = true;
    }
    if (isOpen !== undefined) filter.isOpen = isOpen === 'true';
    if (city) filter.city = new RegExp(city, 'i');
    if (search) {
      filter.$text = { $search: search };
    }

    const [restaurants, total] = await Promise.all([
      Restaurant.find(filter)
        .populate('owner', 'name email')
        .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Restaurant.countDocuments(filter),
    ]);

    return ApiResponse.success(
      res,
      'Restaurants fetched successfully',
      restaurants,
      200,
      buildPagination(page, limit, total)
    );
  } catch (error) {
    next(error);
  }
};

const getRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId).populate(
      'owner',
      'name email'
    );
    if (!restaurant) {
      return ApiResponse.error(res, 'Restaurant not found', 404);
    }

    const categories = await Category.find({
      restaurant: restaurant._id,
      isActive: true,
    }).sort({ sortOrder: 1, name: 1 });

    const menuItems = await MenuItem.find({
      restaurant: restaurant._id,
      isAvailable: true,
    })
      .populate('category', 'name')
      .sort({ name: 1 });

    return ApiResponse.success(res, 'Restaurant fetched successfully', {
      restaurant,
      categories,
      menuItems,
    });
  } catch (error) {
    next(error);
  }
};

const createRestaurant = async (req, res, next) => {
  try {
    // restaurant_admin or super_admin
    const restaurant = await Restaurant.create({
      ...req.body,
      owner: req.user._id,
    });

    // Optionally promote customer to restaurant_admin if creating first restaurant
    if (req.user.role === 'customer') {
      req.user.role = 'restaurant_admin';
      await req.user.save();
    }

    return ApiResponse.created(res, 'Restaurant created successfully', restaurant);
  } catch (error) {
    next(error);
  }
};

const updateRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      return ApiResponse.error(res, 'Restaurant not found', 404);
    }

    // Ownership check (super_admin can update any)
    if (
      req.user.role !== 'super_admin' &&
      restaurant.owner.toString() !== req.user._id.toString()
    ) {
      return ApiResponse.error(res, 'You can only update your own restaurant', 403);
    }

    // Only super_admin can change isActive
    if (req.body.isActive !== undefined && req.user.role !== 'super_admin') {
      delete req.body.isActive;
    }

    Object.assign(restaurant, req.body);
    await restaurant.save();

    return ApiResponse.success(res, 'Restaurant updated successfully', restaurant);
  } catch (error) {
    next(error);
  }
};

const deleteRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      return ApiResponse.error(res, 'Restaurant not found', 404);
    }

    // Soft delete
    restaurant.isActive = false;
    await restaurant.save();

    return ApiResponse.success(res, 'Restaurant deactivated successfully', restaurant);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
};
