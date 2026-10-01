const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.error(res, 'Authentication required. Please provide a valid token.', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return ApiResponse.error(res, 'Authentication required. Please provide a valid token.', 401);
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return ApiResponse.error(res, 'Token has expired. Please login again.', 401);
      }
      return ApiResponse.error(res, 'Invalid token. Please login again.', 401);
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return ApiResponse.error(res, 'User no longer exists.', 401);
    }
    if (user.isBlocked) {
      return ApiResponse.error(res, 'Your account has been blocked. Contact support.', 403);
    }
    if (!user.isActive) {
      return ApiResponse.error(res, 'Your account is inactive.', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    return ApiResponse.error(res, 'Authentication failed.', 401);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, 'Authentication required.', 401);
    }
    if (!roles.includes(req.user.role)) {
      return ApiResponse.error(
        res,
        `Access denied. Required role(s): ${roles.join(', ')}`,
        403
      );
    }
    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.id);
        if (user && !user.isBlocked && user.isActive) {
          req.user = user;
        }
      } catch (_) {
        // ignore invalid token for optional auth
      }
    }
    next();
  } catch (_) {
    next();
  }
};

module.exports = { authenticate, authorize, optionalAuth };
