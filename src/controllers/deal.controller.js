const Deal = require('../models/Deal');
const { defaultDeals } = require('../data/defaultDeals');
const ApiResponse = require('../utils/apiResponse');

const listDeals = async (req, res, next) => {
  try {
    const count = await Deal.countDocuments();
    if (count === 0) {
      await Deal.insertMany(defaultDeals);
    }
    const deals = await Deal.find().sort({ id: 1 });
    return ApiResponse.success(res, 'Deals fetched successfully', deals);
  } catch (error) {
    next(error);
  }
};

const saveDeal = async (req, res, next) => {
  try {
    const payload = req.body;
    let dealId = payload.id;
    if (!dealId) {
      const highest = await Deal.findOne().sort({ id: -1 });
      dealId = highest ? highest.id + 1 : 9001;
    }

    const dealData = { ...payload, id: dealId };
    const saved = await Deal.findOneAndUpdate(
      { id: dealId },
      dealData,
      { new: true, upsert: true, runValidators: true }
    );

    return ApiResponse.success(res, 'Deal saved successfully', saved);
  } catch (error) {
    next(error);
  }
};

const updateDeal = async (req, res, next) => {
  try {
    const deal = await Deal.findOneAndUpdate(
      { id: Number(req.params.id) },
      req.body,
      { new: true }
    );
    if (!deal) return ApiResponse.error(res, 'Deal not found', 404);
    return ApiResponse.success(res, 'Deal updated successfully', deal);
  } catch (error) {
    next(error);
  }
};

const deleteDeal = async (req, res, next) => {
  try {
    const deal = await Deal.findOneAndDelete({ id: Number(req.params.id) });
    if (!deal) return ApiResponse.error(res, 'Deal not found', 404);
    return ApiResponse.success(res, 'Deal deleted successfully', deal);
  } catch (error) {
    next(error);
  }
};

module.exports = { listDeals, saveDeal, updateDeal, deleteDeal };
