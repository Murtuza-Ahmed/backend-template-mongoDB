// import { asyncHandler } from "../../middlewares/asyncHandler.js";
// import User from "../../models/Users.js";
// import { registerWithOtpValidation } from "../../validations/schemas.js";
// import { sendVerificationCode } from "../../hooks/sendVerificationCode.js"
// import ErrorHandler from "../../utils/errorHandler.js";
// import { HTTP_STATUS } from "../../utils/statusCodes.js";

// export const registerWithOtp = asyncHandler(async (req, res, next) => {
//   const { name, email, phone, password, verificationMethod } = req.body;

//   const { error } = registerWithOtpValidation.validate({ name, email, phone, password, verificationMethod })

//   if (error) {
//     return next(new ErrorHandler(error.details[0].message, HTTP_STATUS.BAD_REQUEST))
//   }

//   let user = await User.findOne({
//     $or: [{ email }, { phone }]
//   })

//   // Already verified → don't allow new registration
//   if (user && user.accountVerified) {
//     return next(new ErrorHandler("User already exists. Please login.", HTTP_STATUS.BAD_REQUEST))
//   }

//   // Already registered but not verified → update info + resend OTP
//   if (user && !user.accountVerified) {
//     user.name = name;
//     user.email = email || user.email;
//     user.phone = phone || user.phone;
//     user.password = password;
//   } else {
//     // New user → create new record
//     user = new User({
//       name,
//       email,
//       phone,
//       password,
//       accountVerified: false
//     });
//   }

//   // generate new OTP
//   const verificationCode = await user.generateVerificationCode();
//   await user.save();

//   // Send OTP (email or phone)
//   await sendVerificationCode(verificationMethod, verificationCode, email, phone);

//   return res.status(HTTP_STATUS.CREATED).json({
//     success: true,
//     message: `OTP sent to your ${verificationMethod}. Please verify to activate your account.`,
//     userId: user._id
//   });
// });