const Product = require('../models/Product');
const { DEFAULT_PRODUCTS } = require('../data/defaultProducts');
const ApiResponse = require('../utils/apiResponse');

const listProducts = async (req, res, next) => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      // Auto-populate default storefront products
      await Product.insertMany(DEFAULT_PRODUCTS);
    }

    const filter = {};
    if (req.query.category && req.query.category !== 'All') {
      filter.category = req.query.category;
    }

    const products = await Product.find(filter).sort({ id: 1 });
    return ApiResponse.success(res, 'Products fetched successfully', products);
  } catch (error) {
    next(error);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) return ApiResponse.error(res, 'Product not found', 404);
    return ApiResponse.success(res, 'Product fetched successfully', product);
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const payload = req.body;
    let productId = payload.id;
    if (!productId) {
      const highest = await Product.findOne().sort({ id: -1 });
      productId = highest && typeof highest.id === 'number' ? highest.id + 1 : Date.now();
    }

    const created = await Product.create({ ...payload, id: productId });
    return ApiResponse.created(res, 'Product created successfully', created);
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!product) return ApiResponse.error(res, 'Product not found', 404);
    return ApiResponse.success(res, 'Product updated successfully', product);
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndDelete({ id: req.params.id });
    if (!product) return ApiResponse.error(res, 'Product not found', 404);
    return ApiResponse.success(res, 'Product deleted successfully', product);
  } catch (error) {
    next(error);
  }
};

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
