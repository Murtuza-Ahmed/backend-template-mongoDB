import { HTTP } from "#src/utils/httpStatus.js";
import * as uploadsService from "#src/modules/uploads/uploads.service.js";

export const upload = async (req, res) => {
  const file = await uploadsService.uploadFile(req.file);
  res.status(HTTP.CREATED).json({ success: true, file });
};

export const remove = async (req, res) => {
  const result = await uploadsService.deleteFile(req.query.publicId, req.query.resourceType);
  res.status(HTTP.OK).json({ success: true, ...result });
};
