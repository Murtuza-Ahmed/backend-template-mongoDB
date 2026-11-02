import { ApiError } from "#src/utils/ApiError.js";

// validate(schema) → middleware. Rejects bad input with a clean 400
// before it ever reaches the controller.
export const validate = (schema, source = "body") => (req, _res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });
  if (error) {
    const errors = error.details.map((d) => ({
      field: d.path.join("."),
      message: d.message.replace(/"/g, ""),
    }));
    return next(ApiError.badRequest("Validation failed", errors));
  }
  req[source] = value;
  next();
};
