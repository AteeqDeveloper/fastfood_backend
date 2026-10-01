class ApiResponse {
  static success(res, message = 'Success', data = null, statusCode = 200, pagination = null) {
    const response = {
      success: true,
      message,
    };
    if (data !== null) response.data = data;
    if (pagination) response.pagination = pagination;
    return res.status(statusCode).json(response);
  }

  static error(res, message = 'Something went wrong', statusCode = 500, errors = []) {
    const response = {
      success: false,
      message,
    };
    if (errors && errors.length) response.errors = errors;
    return res.status(statusCode).json(response);
  }

  static created(res, message = 'Created successfully', data = null) {
    return this.success(res, message, data, 201);
  }
}

module.exports = ApiResponse;
