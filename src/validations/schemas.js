import Joi from "joi"

// register validation
export const registerValidation = Joi.object({
  name: Joi.string().min(2).max(20).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name cannot exceed 20 characters"
  }),
  email: Joi.string().email().pattern(new RegExp(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)).required().messages({
    "string.email": "Please enter a valid email",
    "string.empty": "Email is required"
  }),
  phone: Joi.string().pattern(/^(\+92|0)?3\d{9}$/).required().messages({
    "string.pattern.base": "Phone must be valid number (11 digits)",
    "string.empty": "Phone is required"
  }),
  password: Joi.string().min(8).pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)).required().messages({
    "string.min": "Password must be at least 8 characters long",
    "string.pattern.base":
      "Password must include uppercase, lowercase, number, and special character",
    "string.empty": "Password is required"
  }),
  verificationMethod: Joi.string().valid("email", "phone").required().messages({
    "any.only": "Verification method must be either email or phone",
    "string.empty": "Verification method is required"
  })
})

// verify validation
export const verifyValidation = Joi.object({
  userId: Joi.string().length(24).hex().required().messages({
    "string.length": "Invalid user ID",
    "string.hex": "Invalid user ID",
    "string.empty": "User ID is required"
  }),
  otp: Joi.string().pattern(/^\d{5}$/).required().messages({
    "string.pattern.base": "Verification code must be exactly 5 digits",
    "any.required": "Verification code is required"
  })
})

export const loginValidation = Joi.object({
  emailOrPhone: Joi.string().required().messages({
    "string.empty": "Email or phone is required"
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required"
  })
})

// register with otp validation
// export const registerWithOtpValidation = Joi.object({
//   name: Joi.string().min(3).max(50).required().messages({
//     "string.empty": "Name is required",
//     "string.min": "Name must be at least 3 characters",
//     "string.max": "Name must not exceed 50 characters"
//   }),
//   email: Joi.string().email().pattern(new RegExp(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)).messages({
//     "string.email": "Please enter a valid email address",
//   }),
//   phone: Joi.string()
//     .pattern(/^(\+92|0)?3\d{9}$/)
//     .messages({
//       "string.pattern.base": "Phone number must be between 11 digits"
//     }),
//   password: Joi.string().min(8).pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)).required().messages({
//     "string.min": "Password must be at least 8 characters long",
//     "string.pattern.base":
//       "Password must include uppercase, lowercase, number, and special character",
//     "string.empty": "Password is required"
//   }),
//   verificationMethod: Joi.string()
//     .valid("email", "phone")
//     .required()
//     .messages({
//       "any.only": "Verification method must be either email or phone",
//       "string.empty": "Verification method is required"
//     })
// }).when(Joi.object({ verificationMethod: Joi.valid("email") }).unknown(), { //  Agar verificationMethod = email hai to email required
//   then: Joi.object({
//     email: Joi.string().email().required().messages({
//       "any.required": "Email is required when verification method is email"
//     })
//   })
// }).when(Joi.object({ verificationMethod: Joi.valid("phone") }).unknown(), { // Agar verificationMethod = phone hai to phone required
//   then: Joi.object({
//     phone: Joi.string()
//       .pattern(/^[0-9]{10,15}$/)
//       .required()
//       .messages({
//         "any.required": "Phone is required when verification method is phone",
//         "string.pattern.base": "Phone number must be between 10 to 15 digits"
//       })
//   })
// })