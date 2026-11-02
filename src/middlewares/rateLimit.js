import rateLimit from "express-rate-limit";
import { env } from "#src/config/env.js";

// General API protection — generous, just stops floods.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please slow down" },
});

// Strict limits on auth endpoints — brute-force protection.
// Skipped in non-production so local dev/testing stays painless.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: () => !env.isProd,
  message: { success: false, message: "Too many auth attempts, try again later" },
});
