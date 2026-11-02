import app from "./app.js";
import logger from "#utils/logger.js";

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  logger.info(
    `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
});