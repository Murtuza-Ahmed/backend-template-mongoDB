// Wraps async route handlers so thrown errors reach the error middleware
// without try/catch in every controller.
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
