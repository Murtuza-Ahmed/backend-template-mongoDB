import morgan from "morgan";
import { env } from "#src/config/env.js";

// Compact logs in dev, standard combined format in production.
const requestLogger = morgan(env.isProd ? "combined" : "dev");

export default requestLogger;
