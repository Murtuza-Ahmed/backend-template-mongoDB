import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { env } from "#src/config/env.js";

export function signAccessToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), email: user.email, role: user.role, type: "access" },
    env.jwtAccessSecret,
    { expiresIn: env.jwtAccessExpiresIn }
  );
}

export function signRefreshToken(user) {
  // jti makes every token unique even within the same second
  return jwt.sign(
    { sub: user._id.toString(), type: "refresh", jti: crypto.randomUUID() },
    env.jwtRefreshSecret,
    { expiresIn: env.jwtRefreshExpiresIn }
  );
}

// SHA-256 hash before storing — refresh tokens never sit in the DB raw.
export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function verifyAccessToken(token) {
  const payload = jwt.verify(token, env.jwtAccessSecret);
  if (payload.type !== "access") throw new Error("Not an access token");
  return payload;
}

export function verifyRefreshToken(token) {
  const payload = jwt.verify(token, env.jwtRefreshSecret);
  if (payload.type !== "refresh") throw new Error("Not a refresh token");
  return payload;
}
