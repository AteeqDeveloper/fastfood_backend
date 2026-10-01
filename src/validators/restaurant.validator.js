const Joi = require('joi');

const createRestaurantSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  description: Joi.string().trim().allow('').optional(),
  phone: Joi.string().trim().allow('').optional(),
  email: Joi.string().email().lowercase().trim().allow('').optional(),
  address: Joi.string().trim().allow('').optional(),
  city: Joi.string().trim().allow('').optional(),
  image: Joi.string().uri().allow('').optional(),
  openingTime: Joi.string().pattern(/^\d{2}:\d{2}$/).optional(),
  closingTime: Joi.string().pattern(/^\d{2}:\d{2}$/).optional(),
  isOpen: Joi.boolean().optional(),
});

const updateRestaurantSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  description: Joi.string().trim().allow('').optional(),
  phone: Joi.string().trim().allow('').optional(),
  email: Joi.string().email().lowercase().trim().allow('').optional(),
  address: Joi.string().trim().allow('').optional(),
  city: Joi.string().trim().allow('').optional(),
  image: Joi.string().uri().allow('').optional(),
  openingTime: Joi.string().pattern(/^\d{2}:\d{2}$/).optional(),
  closingTime: Joi.string().pattern(/^\d{2}:\d{2}$/).optional(),
  isOpen: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
}).min(1);

module.exports = { createRestaurantSchema, updateRestaurantSchema };
