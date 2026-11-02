import { cloudinary, cloudinaryConfigured, uploadFolder } from "#src/config/cloudinary.js";
import { detectFileKind } from "#src/utils/fileType.js";
import { ApiError } from "#src/utils/ApiError.js";
import { env } from "#src/config/env.js";

const SIZE_LIMITS = () => ({
  image: env.cloudinary.maxImageMb * 1024 * 1024,
  video: env.cloudinary.maxVideoMb * 1024 * 1024,
  document: env.cloudinary.maxDocMb * 1024 * 1024,
});

function uploadStream(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });
}

// Single entry point for every file upload in the template:
// magic-byte validated → size-checked → stored under
// <CLOUDINARY_FOLDER>/<kind>s/ (e.g. app-uploads/images).
export async function uploadFile(file) {
  if (!cloudinaryConfigured()) {
    throw new ApiError(503, "Uploads are not configured (Cloudinary credentials missing)");
  }
  if (!file?.buffer?.length) throw ApiError.badRequest("No file received");

  const detected = detectFileKind(file.buffer);
  if (!detected) {
    throw ApiError.badRequest(
      "Unsupported file type — only JPG, PNG, GIF, WebP, MP4 and PDF are allowed"
    );
  }

  const maxBytes = SIZE_LIMITS()[detected.kind];
  if (file.buffer.length > maxBytes) {
    const maxMb = Math.round(maxBytes / 1024 / 1024);
    throw ApiError.badRequest(`File too large — ${detected.kind}s must be under ${maxMb}MB`);
  }

  const result = await uploadStream(file.buffer, {
    folder: uploadFolder(detected.kind),
    resource_type: "auto",
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    kind: detected.kind,
    format: result.format,
    bytes: result.bytes,
    width: result.width ?? null,
    height: result.height ?? null,
  };
}

export async function deleteFile(publicId, resourceType = "image") {
  if (!cloudinaryConfigured()) throw new ApiError(503, "Uploads are not configured");
  const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  if (result.result !== "ok") throw ApiError.notFound("File not found in storage");
  return { message: "File deleted" };
}
