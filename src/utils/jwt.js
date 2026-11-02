import jwt from "jsonwebtoken"
// import crypto from "crypto"
import logger from "./logger.js"
import { config } from "dotenv";

config({ path: "./config.env" });

const JWT_SECRET_ACCESS = process.env.JWT_ACCESS_SECRET
const JWT_SECRET_ACCESS_EXPIRE = process.env.JWT_ACCESS_SECRET_EXPIRES_IN
const JWT_SECRET_REFRESH = process.env.JWT_REFRESH_SECRET
const JWT_SECRET_REFRESH_EXPIRE = process.env.JWT_REFRESH_SECRET_EXPIRES_IN

if (
  !JWT_SECRET_ACCESS
  ||
  !JWT_SECRET_REFRESH
) {
  throw new Error("JWT secrets are not defined in environment variables")
}

// Access Token
export const generateAccessToken = (user) => {
  const payload = {
    userId: user._id,
    email: user.email,
    type: "access"
  }

  return jwt.sign(payload, JWT_SECRET_ACCESS, { expiresIn: JWT_SECRET_ACCESS_EXPIRE })
}

// Refresh Token
export const generateRefreshToken = (user) => {
  const payload = {
    userId: user._id,
    email: user.email,
    type: "refresh"
  }

  return jwt.sign(payload, JWT_SECRET_REFRESH, { expiresIn: JWT_SECRET_REFRESH_EXPIRE })
}

// Verify Access Token

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET_ACCESS)
  } catch (error) {
    logger.info("Token verification failed:", error)
    return null
  }
}

// Verify Refresh Token
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET_REFRESH)
  } catch (error) {
    logger.error("Token verification failed:", error)
    return null
  }
}

// Decode Token
// export const decodeToken = (token) => {
//   try {
//     return jwt.decode(token, { complete: true })
//   } catch (error) {
//     logger.error("Token decoding failed:", error)
//     return null
//   }
// }

// Hash Token
// export const hashToken = (token) => {
//   try {
//     return crypto.createHash("sha256").update(token).digest("hex")
//   } catch (error) {
//     logger.error("Token hashing failed:", error)
//     return null
//   }
// }