import { asyncHandler } from "#middlewares/asyncHandler.js";
import User from "#models/Users.js";
import ErrorHandler from "#utils/errorHandler.js";
import { sendToken } from "#utils/sendToken.js";
import { HTTP_STATUS } from "#utils/statusCodes.js";
import { verifyValidation } from "../../validations/schemas.js";

export const verifyAccount = asyncHandler(async (req, res, next) => {
  const { userId, otp } = req.body;

  const { error } = verifyValidation.validate({ userId, otp })
  if (error) {
    return next(new ErrorHandler(error.details[0].message, HTTP_STATUS.BAD_REQUEST))
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHandler("User not found", HTTP_STATUS.NOT_FOUND))
  }

  if (Number(user.verificationCode) !== Number(otp)) {
    return next(new ErrorHandler("Invalid verification code", HTTP_STATUS.BAD_REQUEST))
  }

  if (new Date(user.verificationCodeExpire).getTime() < Date.now()) {
    return next(new ErrorHandler("Verification code has expired", HTTP_STATUS.BAD_REQUEST))
  }

  user.accountVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpire = undefined;
  await user.save({ validateModifiedOnly: true });
  return sendToken(user, res);
}) 