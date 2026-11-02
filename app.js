import e from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors"
import { dbConnection } from "./src/database/db.js";
import { errorMiddleware } from "./src/middlewares/error.js";
import morganMiddleware from "./src/middlewares/morganLogger.js";
import userRouter from "./src/routes/userRoutes.js"

const app = e();
config({ path: "./config.env" });
const configuredOrigins =
  process.env.FRONTEND_URLS?.trim() || process.env.FRONTEND_URL?.trim() || "";
const allowedOrigins = [...new Set(configuredOrigins
  .split(",")
  .flatMap((value) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return [];
    }

    try {
      const url = new URL(trimmedValue);
      if (
        !["http:", "https:"].includes(url.protocol) ||
        url.username ||
        url.password ||
        url.pathname !== "/" ||
        url.search ||
        url.hash ||
        (trimmedValue !== url.origin && trimmedValue !== `${url.origin}/`)
      ) {
        return [];
      }

      return [url.origin];
    } catch {
      return [];
    }
  }))];
const isCorsDebugEnabled =
  process.env.NODE_ENV !== "production" || process.env.CORS_DEBUG === "true";

app.use(
  cors({
    origin: (origin, callback) => {
      const isAllowed = Boolean(origin && allowedOrigins.includes(origin));
      if (isCorsDebugEnabled) {
        console.info("[CORS] Origin check", {
          origin: origin ?? null,
          allowedOrigins,
          allowed: isAllowed,
        });
      }

      if (isAllowed) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

app.use(cookieParser());
// Middleware
app.use(e.json());
app.use(morganMiddleware); // log HTTP requests
app.use(e.urlencoded({ extended: true }));

app.use("/api/v1", userRouter)

dbConnection();

app.use(errorMiddleware)

export default app;