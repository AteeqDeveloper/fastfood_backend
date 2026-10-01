const Joi = require('joi');

const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(1).max(50).required(),
  description: Joi.string().trim().allow('').optional(),
  image: Joi.string().uri().allow('').optional(),
  sortOrder: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional(),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(1).max(50).optional(),
  description: Joi.string().trim().allow('').optional(),
  image: Joi.string().uri().allow('').optional(),
  sortOrder: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional(),
}).min(1);

module.exports = { createCategorySchema, updateCategorySchema };
