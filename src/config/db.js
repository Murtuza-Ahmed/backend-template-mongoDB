import mongoose from "mongoose";
import { env } from "#src/config/env.js";
import logger from "#src/utils/logger.js";

export async function connectDB() {
  try {
    await mongoose.connect(env.mongoUri, {
      // Keep idle connections alive — cloud DBs (Atlas etc.) drop them
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
    });
    logger.info("✅ MongoDB connected");
  } catch (err) {
    logger.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected — will retry on next operation");
});
