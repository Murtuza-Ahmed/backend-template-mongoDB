// import mongoose from "mongoose";
// import { asyncHandler } from "../../middlewares/asyncHandler.js";
// import ErrorHandler from "../../utils/errorHandler.js";
// import { generateAccessToken, hashToken, verifyRefreshToken } from "../../utils/jwt.js";
// import { HTTP_STATUS } from "../../utils/statusCodes.js";

// export const refresh = asyncHandler(async (req, res, next) => {
//   const User = mongoose.model("Users");
//   const refreshToken = req.headers.authorization;

//   if (!refreshToken || !refreshToken.startsWith("Bearer ")) {
//     return next(new ErrorHandler("Unauthorized: No token provided", HTTP_STATUS.UNAUTHORIZED));
//   }

//   const token = refreshToken.split(" ")[1]
//   const decoded = verifyRefreshToken(token)

//   if (!decoded) {
//     return next(new ErrorHandler("Invalid refresh token", HTTP_STATUS.UNAUTHORIZED))
//   }

//   const user = await User.findById(decoded.userId)

//   if (!user) {
//     return next(new ErrorHandler("User not found", HTTP_STATUS.UNAUTHORIZED))
//   }

//   const hashedIncomingToken = hashToken(token)

//   if (hashedIncomingToken !== user.refreshToken) {
//     return next(new ErrorHandler("Refresh token mismatch", HTTP_STATUS.UNAUTHORIZED));
//   }

//   const newAccessToken = generateAccessToken(user)

//   return res.status(HTTP_STATUS.OK).json({
//     success: true,
//     accessToken: newAccessToken
//   })

// })