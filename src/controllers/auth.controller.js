const authService = require('../services/auth.service');
const ApiResponse = require('../utils/apiResponse');

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return ApiResponse.created(res, 'Registration successful', result);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return ApiResponse.success(res, 'Login successful', result);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  // Stateless JWT - client discards token. Optional blacklist could be added.
  return ApiResponse.success(res, 'Logged out successfully');
};

module.exports = { register, login, logout };
