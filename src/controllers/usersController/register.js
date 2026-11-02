import User from "#models/Users.js";
import { registerValidation } from "../../validations/schemas.js";
import { asyncHandler } from "#middlewares/asyncHandler.js";
import ErrorHandler from "#utils/errorHandler.js";
import { HTTP_STATUS } from "#utils/statusCodes.js";
import { sendVerificationCode } from "#hooks/sendVerificationCode.js";


export const register = asyncHandler(async (req, res, next) => {

  const { name, email, phone, password, verificationMethod } = req.body

  const { error } = registerValidation.validate({ name, email, phone, password, verificationMethod });

  if (error) {
    return next(new ErrorHandler(error.details[0].message, HTTP_STATUS.BAD_REQUEST))
  }

  // 2️⃣ Check if user already exists
  let user = await User.findOne({
    $or: [{ email }, { phone }]
  });

  if (user) {
    if (user.accountVerified) {
      return next(new ErrorHandler("User already exists and Verified. Please login.", HTTP_STATUS.BAD_REQUEST))
    } else {
      const newCode = await user.generateVerificationCode();
      await user.save();
      const verificationResult = await sendVerificationCode(verificationMethod, newCode, email, phone);

      if (!verificationResult.success) {
        return next(
          new ErrorHandler(
            "Unable to send verification code. Please try again.",
            HTTP_STATUS.BAD_REQUEST
          )
        );
      }

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: email ?
          "User already exists but not verified. A new verification code has been sent to your email address."
          :
          "User already exists but not verified. A new verification code has been sent to your phone number.",
        userId: user._id
      })
    }
  }

  // if (exitingUser) {
  //   if (exitingUser.email === email) {
  //     return next(new ErrorHandler("Email already exits", HTTP_STATUS.BAD_REQUEST))
  //   }
  //   if (exitingUser.phone === phone) {
  //     return next(new ErrorHandler("Phone number already exits", HTTP_STATUS.BAD_REQUEST))
  //   }
  // }

  // const registrationAttemptByUser = await User.find({
  //   $or: [
  //     { email, accountVerified: false },
  //     { phone, accountVerified: false }
  //   ]
  // })

  // if (registrationAttemptByUser.length >= 2) {
  //   return next(new ErrorHandler("Too many registration attempts. Please wait 30 minutes before trying again.", HTTP_STATUS.BAD_REQUEST))
  // }

  const userData = {
    name,
    email,
    phone,
    password,
    accountVerified: false
  }

  user = await User.create(userData)

  const verificationCode = await user.generateVerificationCode()
  await user.save()
  const verificationResult = await sendVerificationCode(verificationMethod, verificationCode, email, phone)

  if (!verificationResult.success) {
    return next(
      new ErrorHandler(
        "Unable to send verification code. Please try again.",
        HTTP_STATUS.BAD_REQUEST
      )
    );
  }

  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: email ?
      "User registered successfully. A verification code has been sent to your email address."
      :
      "User registered successfully. A verification code has been sent to your phone number.",
    userId: user._id
  })
})