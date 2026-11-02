import mongoose from "mongoose";
import { asyncHandler } from "#middlewares/asyncHandler.js";
import { HTTP_STATUS } from "#utils/statusCodes.js";

export const logout = asyncHandler(async (req, res, next) => {
  const User = mongoose.model("Users");

  const { _id } = req.user;

  const user = await User.findById(_id);
  if (!user || !user.refreshToken) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: "User already logged out or token invalid",
    });
  }

  user.refreshToken = null;
  await user.save({ validateModifiedOnly: true });

  return res.status(HTTP_STATUS.OK).clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
  }).json({
    success: true,
    message: "Logout successful",
  });
})