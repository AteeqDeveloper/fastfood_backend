const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');

const getMe = async (req, res, next) => {
  try {
    return ApiResponse.success(res, 'User fetched successfully', {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      createdAt: req.user.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    if (name !== undefined) req.user.name = name;
    if (phone !== undefined) req.user.phone = phone;
    await req.user.save();

    return ApiResponse.success(res, 'Profile updated successfully', {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return ApiResponse.error(res, 'Current password is incorrect', 400);
    }

    user.password = newPassword;
    await user.save();

    return ApiResponse.success(res, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { getMe, updateProfile, changePassword };
