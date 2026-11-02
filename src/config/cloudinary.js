import { v2 as cloudinary } from "cloudinary";
import { env } from "#src/config/env.js";
import logger from "#src/utils/logger.js";

if (env.cloudinary.name && env.cloudinary.apiKey && env.cloudinary.apiSecret) {
  cloudinary.config({
    cloud_name: env.cloudinary.name,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
  });
  logger.info("✅ Cloudinary configured");
} else {
  logger.warn("Cloudinary credentials missing — /api/uploads will return 503 until set");
}

export const cloudinaryConfigured = () =>
  Boolean(env.cloudinary.name && env.cloudinary.apiKey && env.cloudinary.apiSecret);

// Root folder for every upload. Rename once in .env (CLOUDINARY_FOLDER)
// and every file in your Cloudinary account follows.
export const uploadFolder = (kind) => `${env.cloudinary.folder}/${kind}s`;

export { cloudinary };
