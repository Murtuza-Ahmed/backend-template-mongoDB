import { asyncHandler } from "#middlewares/asyncHandler.js";
import User from "#models/Users.js";
import ErrorHandler from "#utils/errorHandler.js";
import { sendToken } from "#utils/sendToken.js";
import { HTTP_STATUS } from "#utils/statusCodes.js";
import crypto from "crypto";

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;

  const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  })

  if (!user) {
    return next(new ErrorHandler("Reset password token is invalid or has been expired", HTTP_STATUS.GONE));
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("password & confirm-password do not match", HTTP_STATUS.BAD_REQUEST));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendToken(user, res)
});