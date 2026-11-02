// NoSQL injection guard, written for Express 5.
//
// Why not express-mongo-sanitize? Its latest version still crashes on
// Express 5 — it tries to reassign req.query, which is getter-only there.
// This tiny dependency-free middleware does the same job safely:
//
// - strips any key containing `$` or starting with `.` (the MongoDB
//   operator vectors: $gt, $ne, $where, …) from body, params and query
// - for req.query it defines a sanitized *own* property that shadows
//   Express 5's prototype getter, instead of reassigning it
const SUSPICIOUS = /\$|\./;

function clean(value) {
  if (Array.isArray(value)) {
    for (const item of value) clean(item);
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const key of Object.keys(value)) {
    if (SUSPICIOUS.test(key)) {
      delete value[key];
    } else {
      clean(value[key]);
    }
  }
}

export function sanitize(req, _res, next) {
  clean(req.body);
  clean(req.params);
  try {
    const q = req.query;
    if (q && typeof q === "object") {
      clean(q);
      Object.defineProperty(req, "query", {
        value: q,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    }
  } catch {
    // query parsing disabled — nothing to sanitize
  }
  next();
}
