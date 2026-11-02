import pino from "pino";
import { env } from "#src/config/env.js";

// Pretty logs in dev, JSON in production. If the pretty transport can't
// load (partial install etc.), fall back to plain pino — never crash.
function buildLogger() {
  if (env.isProd) return pino({ level: "info" });
  try {
    return pino({
      level: "debug",
      transport: {
        target: "pino-pretty",
        options: { colorize: true, translateTime: "HH:MM:ss" },
      },
    });
  } catch {
    return pino({ level: "debug" });
  }
}

const logger = buildLogger();
export default logger;
