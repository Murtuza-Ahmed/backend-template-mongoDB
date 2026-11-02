// Entry point: env → DB → app → listen.
// Keep it thin — everything else lives in src/.
import { env } from "#src/config/env.js";
import { connectDB } from "#src/config/db.js";
import { createApp } from "#src/app.js";
import logger from "#src/utils/logger.js";

process.on("unhandledRejection", (err) => {
  logger.error("Unhandled rejection — shutting down:", err);
  process.exit(1);
});

async function start() {
  await connectDB();
  const app = await createApp();

  app.listen(env.port, () => {
    logger.info(`🚀 ${env.appName} API running in ${env.nodeEnv} mode on port ${env.port}`);
  });
}

start();
