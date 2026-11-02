import { asyncHandler } from "#middlewares/asyncHandler.js";
import mongoose from "mongoose";
import ErrorHandler from "#utils/errorHandler.js";
import { HTTP_STATUS } from "#utils/statusCodes.js";
import {
  generateAccessToken,
  generateRefreshToken
} from "#utils/jwt.js";
import { loginValidation } from "../../validations/schemas.js";

export const login = asyncHandler(async (req, res, next) => {
  const User = mongoose.model("Users");

  const { emailOrPhone, password } = req.body;

  const { error } = loginValidation.validate({ emailOrPhone, password });
  if (error) {
    return next(new ErrorHandler(error.details[0].message, HTTP_STATUS.BAD_REQUEST))
  }

  const userAccount = await User.findOne({
    $or: [
      { email: emailOrPhone, accountVerified: false },
      { phone: emailOrPhone, accountVerified: false }
    ],
  })

  if (userAccount && !userAccount.accountVerified) {
    return next(new ErrorHandler("Please verify your account before logging in", HTTP_STATUS.UNAUTHORIZED))
  }

  const user = await User.findOne({
    $or: [
      { email: emailOrPhone, accountVerified: true },
      { phone: emailOrPhone, accountVerified: true }
    ],
  })

  if (!user) {
    return next(new ErrorHandler("Invalid email/phone or password", HTTP_STATUS.UNAUTHORIZED))
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return next(new ErrorHandler("Invalid email/phone or password", HTTP_STATUS.UNAUTHORIZED))
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user)

  user.accessToken = accessToken;
  user.refreshToken = refreshToken;

  await user.save({ validateModifiedOnly: true });

  return res.status(HTTP_STATUS.OK).cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  }).json({
    success: true,
    message: "Login successful",
    refreshToken,
    accessToken,
    user
  })
})