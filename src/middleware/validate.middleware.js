const ApiResponse = require('../utils/apiResponse');

const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((d) => d.message.replace(/"/g, ''));
      return ApiResponse.error(res, 'Validation failed', 422, errors);
    }

    req[property] = value;
    next();
  };
};

const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return ApiResponse.error(res, `Invalid ${paramName}`, 400);
    }
    next();
  };
};

module.exports = { validate, validateObjectId };
