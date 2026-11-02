import { generateAccessToken, generateRefreshToken } from "./jwt.js";
import { HTTP_STATUS } from "./statusCodes.js";
import { config } from "dotenv"

config({ path: "./config.env" })

export const sendToken = (user, res) => {
  const refreshToken = generateRefreshToken(user)
  const accessToken = generateAccessToken(user)
  user.accessToken = accessToken;
  user.refreshToken = refreshToken;
  user.save({ validateModifiedOnly: true });
  res.status(HTTP_STATUS.OK).cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  }).json({
    success: true,
    message: "Account verified successfully",
    user
  });
};