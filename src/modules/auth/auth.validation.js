import Joi from "joi";

const email = Joi.string().trim().lowercase().email().max(255).required();
const password = Joi.string().min(8).max(72).required();
const otp = Joi.string().trim().length(6).pattern(/^\d{6}$/).required()
  .messages({ "string.pattern.base": "OTP must be 6 digits" });

export const signupSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().trim().lowercase().email().max(255).required(),
  phone: Joi.string().trim().max(20).optional(),
  password,
  confirmPassword: Joi.string().valid(Joi.ref("password")).required()
    .messages({ "any.only": "Passwords do not match" }),
});

export const verifyEmailSchema = Joi.object({ email, otp });

export const signinSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().max(255).required(),
  password: Joi.string().required(),
});

export const googleSchema = Joi.object({
  idToken: Joi.string().required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().max(255).required(),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(8).max(72).required(),
  confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required()
    .messages({ "any.only": "Passwords do not match" }),
});

export const forgotEmailSchema = Joi.object({
  phone: Joi.string().trim().required(),
});

export const recoverEmailSchema = Joi.object({
  phone: Joi.string().trim().required(),
  otp,
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(72).required(),
  confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required()
    .messages({ "any.only": "Passwords do not match" }),
});

export const requestEmailChangeSchema = Joi.object({
  newEmail: Joi.string().trim().lowercase().email().max(255).required(),
});

export const confirmEmailChangeSchema = Joi.object({ otp });
