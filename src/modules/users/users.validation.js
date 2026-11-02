import Joi from "joi";

const objectId = Joi.string().hex().length(24);

export const updateMeSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).optional(),
  phone: Joi.string().trim().max(20).allow("", null).optional(),
  avatarUrl: Joi.string().uri().allow("", null).optional(),
});

export const adminCreateUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().trim().lowercase().email().max(255).required(),
  phone: Joi.string().trim().max(20).optional(),
  password: Joi.string().min(8).max(72).required(),
  role: Joi.string().valid("user", "admin").default("user"),
});

export const adminUpdateUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).optional(),
  phone: Joi.string().trim().max(20).allow("", null).optional(),
  role: Joi.string().valid("user", "admin").optional(),
  isActive: Joi.boolean().optional(),
});

export const userIdParamSchema = Joi.object({ id: objectId.required() });
