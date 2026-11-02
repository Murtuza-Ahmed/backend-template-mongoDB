import { ApiError } from "#src/utils/ApiError.js";
import { verifyAccessToken } from "#src/utils/tokens.js";
import { User } from "#src/models/User.js";
import { asyncHandler } from "#src/middlewares/asyncHandler.js";

// requireAuth — accepts `Authorization: Bearer <token>` or the
// `accessToken` httpOnly cookie. Attaches a fresh user doc to req.user.
export const requireAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ")
    ? header.slice(7)
    : req.cookies?.accessToken;

  if (!token) throw ApiError.unauthorized("Authentication required");

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw ApiError.unauthorized("Invalid or expired token");
  }

  const user = await User.findById(payload.sub);
  if (!user) throw ApiError.unauthorized("User no longer exists");
  if (!user.isActive) throw ApiError.forbidden("Account is deactivated");

  req.user = user;
  next();
});
