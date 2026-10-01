const Joi = require('joi');

const createMenuItemSchema = Joi.object({
  category: Joi.string().hex().length(24).required(),
  name: Joi.string().trim().min(1).max(100).required(),
  description: Joi.string().trim().allow('').optional(),
  price: Joi.number().min(0).required(),
  discountPrice: Joi.number().min(0).allow(null).optional(),
  image: Joi.string().uri().allow('').optional(),
  ingredients: Joi.array().items(Joi.string().trim()).optional(),
  preparationTime: Joi.number().integer().min(0).optional(),
  isAvailable: Joi.boolean().optional(),
});

const updateMenuItemSchema = Joi.object({
  category: Joi.string().hex().length(24).optional(),
  name: Joi.string().trim().min(1).max(100).optional(),
  description: Joi.string().trim().allow('').optional(),
  price: Joi.number().min(0).optional(),
  discountPrice: Joi.number().min(0).allow(null).optional(),
  image: Joi.string().uri().allow('').optional(),
  ingredients: Joi.array().items(Joi.string().trim()).optional(),
  preparationTime: Joi.number().integer().min(0).optional(),
  isAvailable: Joi.boolean().optional(),
}).min(1);

const availabilitySchema = Joi.object({
  isAvailable: Joi.boolean().required(),
});

module.exports = {
  createMenuItemSchema,
  updateMenuItemSchema,
  availabilitySchema,
};
