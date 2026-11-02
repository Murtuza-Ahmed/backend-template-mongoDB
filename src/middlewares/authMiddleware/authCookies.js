import { asyncHandler } from "#middlewares/asyncHandler.js";
import ErrorHandler from "#utils/errorHandler.js";
import { verifyRefreshToken } from "#utils/jwt.js";
import { HTTP_STATUS } from "#utils/statusCodes.js";
import mongoose from "mongoose";

export const isAuthCookies = asyncHandler(async (req, res, next) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return next(
      new ErrorHandler("Unauthorized: No token provided", HTTP_STATUS.UNAUTHORIZED)
    );
  }

  let decoded = verifyRefreshToken(token);

  if (!decoded) {
    return next(
      new ErrorHandler("Invalid or expired token", HTTP_STATUS.UNAUTHORIZED)
    );
  }

  const User = mongoose.model("Users");
  const user = await User.findById(decoded.userId);

  if (!user || user.refreshToken !== token) {
    return next(
      new ErrorHandler("Unauthorized: Token mismatch", HTTP_STATUS.UNAUTHORIZED)
    );
  }

  req.user = user;
  next();
});
