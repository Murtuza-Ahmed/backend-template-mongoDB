import { ApiError } from "#src/utils/ApiError.js";

// Role-based access control. Use AFTER requireAuth:
//   router.get("/admin", requireAuth, authorize("admin"), handler)
export const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized("Authentication required"));
  if (!roles.includes(req.user.role)) {
    return next(ApiError.forbidden("You don't have permission for this action"));
  }
  next();
};
