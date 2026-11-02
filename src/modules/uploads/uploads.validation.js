import Joi from "joi";

export const deleteUploadSchema = Joi.object({
  publicId: Joi.string().trim().required(),
  resourceType: Joi.string().valid("image", "video", "raw").default("image"),
});
