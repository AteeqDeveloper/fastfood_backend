const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

const register = async ({ name, email, password, phone }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({
    name,
    email,
    password,
    phone: phone || '',
    role: 'customer',
  });

  const accessToken = generateToken({ id: user._id, role: user.role });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    accessToken,
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  if (user.isBlocked) {
    const error = new Error('Your account has been blocked');
    error.statusCode = 403;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const accessToken = generateToken({ id: user._id, role: user.role });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    accessToken,
  };
};

module.exports = { register, login };
