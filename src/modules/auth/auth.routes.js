import { Router } from "express";
import { asyncHandler } from "#src/middlewares/asyncHandler.js";
import { validate } from "#src/middlewares/validate.js";
import { requireAuth } from "#src/middlewares/auth.js";
import { authLimiter } from "#src/middlewares/rateLimit.js";
import * as ctrl from "#src/modules/auth/auth.controller.js";
import {
  signupSchema,
  verifyEmailSchema,
  signinSchema,
  googleSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  forgotEmailSchema,
  recoverEmailSchema,
  changePasswordSchema,
  requestEmailChangeSchema,
  confirmEmailChangeSchema,
} from "#src/modules/auth/auth.validation.js";

// Mounted automatically at /api/auth by src/routes/index.js
const router = Router();

router.post("/signup", authLimiter, validate(signupSchema), asyncHandler(ctrl.signup));
router.post("/verify-email", authLimiter, validate(verifyEmailSchema), asyncHandler(ctrl.verifyEmail));
router.post("/signin", authLimiter, validate(signinSchema), asyncHandler(ctrl.signin));
router.post("/google", authLimiter, validate(googleSchema), asyncHandler(ctrl.google));
router.post("/refresh", asyncHandler(ctrl.refresh));
router.post("/logout", requireAuth, asyncHandler(ctrl.logout));

router.post("/forgot-password", authLimiter, validate(forgotPasswordSchema), asyncHandler(ctrl.forgotPassword));
router.post("/reset-password", authLimiter, validate(resetPasswordSchema), asyncHandler(ctrl.resetPassword));

router.post("/forgot-email", authLimiter, validate(forgotEmailSchema), asyncHandler(ctrl.forgotEmail));
router.post("/recover-email", authLimiter, validate(recoverEmailSchema), asyncHandler(ctrl.recoverEmail));

router.post("/change-password", requireAuth, validate(changePasswordSchema), asyncHandler(ctrl.changePassword));
router.post("/change-email/request", requireAuth, validate(requestEmailChangeSchema), asyncHandler(ctrl.requestEmailChange));
router.post("/change-email/confirm", requireAuth, validate(confirmEmailChangeSchema), asyncHandler(ctrl.confirmEmailChange));

export default router;
