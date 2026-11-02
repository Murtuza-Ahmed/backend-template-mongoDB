import { Router } from "express";
import { asyncHandler } from "#src/middlewares/asyncHandler.js";
import { validate } from "#src/middlewares/validate.js";
import { requireAuth } from "#src/middlewares/auth.js";
import { authorize } from "#src/middlewares/authorize.js";
import * as ctrl from "#src/modules/users/users.controller.js";
import {
  updateMeSchema,
  adminCreateUserSchema,
  adminUpdateUserSchema,
  userIdParamSchema,
} from "#src/modules/users/users.validation.js";

// Mounted automatically at /api/users by src/routes/index.js.
// NOTE: "/me" routes come before "/:id" so "me" is never read as an id.
const router = Router();

router.get("/me", requireAuth, asyncHandler(ctrl.getMe));
router.patch("/me", requireAuth, validate(updateMeSchema), asyncHandler(ctrl.updateMe));

router.get("/", requireAuth, authorize("admin"), asyncHandler(ctrl.listUsers));
router.post("/", requireAuth, authorize("admin"), validate(adminCreateUserSchema), asyncHandler(ctrl.adminCreateUser));
router.get("/:id", requireAuth, authorize("admin"), validate(userIdParamSchema, "params"), asyncHandler(ctrl.getUserById));
router.patch("/:id", requireAuth, authorize("admin"), validate(userIdParamSchema, "params"), validate(adminUpdateUserSchema), asyncHandler(ctrl.adminUpdateUser));
router.delete("/:id", requireAuth, authorize("admin"), validate(userIdParamSchema, "params"), asyncHandler(ctrl.adminDeleteUser));

export default router;
