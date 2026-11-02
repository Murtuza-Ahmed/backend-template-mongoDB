import { asyncHandler } from "#middlewares/asyncHandler.js";
import ErrorHandler from "#utils/errorHandler.js";
import { HTTP_STATUS } from "#utils/statusCodes.js";
import {
  verifyAccessToken,
  verifyRefreshToken
} from "#utils/jwt.js";
import mongoose from "mongoose";

export const isAuthenticated = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ErrorHandler("Unauthorized: No token provided", HTTP_STATUS.UNAUTHORIZED));
  }
  const token = authHeader.split(" ")[1];

  let decoded;

  // Try Access Token
  decoded = verifyAccessToken(token);

  const User = mongoose.model("Users");

  if (!decoded) {
    // If access token failed, try refresh token
    decoded = verifyRefreshToken(token);
    if (!decoded) {
      return next(new ErrorHandler("Invalid or expired token", HTTP_STATUS.UNAUTHORIZED));
    }

    // Check DB for refresh token match
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== token) {
      return next(new ErrorHandler("Unauthorized: Token mismatch", HTTP_STATUS.UNAUTHORIZED));
    }

    req.user = decoded;
    return next();
  }

  // Access token valid
  req.user = decoded

  // ***Important Fix Here***
  const user = await User.findById(decoded.userId);
  if (!user || !user.refreshToken) {
    return next(new ErrorHandler("Unauthorized: Logged out", HTTP_STATUS.UNAUTHORIZED));
  }
  next()
})
