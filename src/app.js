import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { sanitize } from "#src/middlewares/sanitize.js";
import hpp from "hpp";
import { env } from "#src/config/env.js";
import { registerRoutes } from "#src/routes/index.js";
import { apiLimiter } from "#src/middlewares/rateLimit.js";
import requestLogger from "#src/middlewares/requestLogger.js";
import { notFound, errorHandler } from "#src/middlewares/error.js";

export async function createApp() {
  const app = express();

  // ── Security headers ──
  app.use(helmet());

  // ── CORS (env-driven allowlist) ──
  app.use(
    cors({
      origin: (origin, cb) => {
        // Allow server-to-server / curl / Postman (no Origin header)
        if (!origin) return cb(null, true);
        if (env.frontendUrls.includes(origin)) return cb(null, true);
        return cb(null, false);
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // ── Body parsing + injection guards ──
  app.use(express.json({ limit: "20kb" }));
  app.use(express.urlencoded({ extended: true, limit: "20kb" }));
  app.use(cookieParser());
  app.use(sanitize); // NoSQL injection guard (Express 5 safe)
  app.use(hpp()); // HTTP parameter pollution guard

  // ── Logging + rate limiting ──
  app.use(requestLogger);
  app.use("/api", apiLimiter);

  // ── Health check ──
  app.get("/api/health", (_req, res) => {
    res.json({ success: true, status: "ok", service: "backend-template", time: new Date().toISOString() });
  });

  // ── Dynamic module routes: /api/<module> ──
  await registerRoutes(app);

  // ── 404 + central error handler (always last) ──
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
