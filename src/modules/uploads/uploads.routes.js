import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "#src/middlewares/asyncHandler.js";
import { validate } from "#src/middlewares/validate.js";
import { requireAuth } from "#src/middlewares/auth.js";
import * as ctrl from "#src/modules/uploads/uploads.controller.js";
import { deleteUploadSchema } from "#src/modules/uploads/uploads.validation.js";

// Mounted automatically at /api/uploads by src/routes/index.js
const router = Router();

// Memory storage — the buffer goes straight to Cloudinary, nothing
// is written to disk. 60MB cap; the service enforces per-type limits.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 60 * 1024 * 1024 },
});

router.post("/", requireAuth, upload.single("file"), asyncHandler(ctrl.upload));
router.delete("/", requireAuth, validate(deleteUploadSchema, "query"), asyncHandler(ctrl.remove));

export default router;
