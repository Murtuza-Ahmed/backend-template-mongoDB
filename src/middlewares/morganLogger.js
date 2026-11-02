import morgan from "morgan";
import logger from "#utils/logger.js";

// Morgan setup with Pino stream
const morganMiddleware = morgan("tiny", {
  stream: {
    write: (message) => logger.info(message.trim())
  }
})

export default morganMiddleware 