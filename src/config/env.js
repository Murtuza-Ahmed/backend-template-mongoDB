import { config } from "dotenv";

// Load .env as early as possible — every other module reads from here.
// NOTE: no logger import here on purpose — logger itself reads env,
// so importing it would create a circular dependency. Plain console
// is correct for the very first module that boots.
config();

const required = [
  "MONGODB_URI",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
];

const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing required env vars: ${missing.join(", ")}`);
  console.error("Copy .env.example to .env and fill the values, then restart.");
  process.exit(1);
}

const warnDefault = (key, badValues) => {
  if (badValues.includes(process.env[key])) {
    console.warn(`⚠️  ${key} is still the example value — change it before going live.`);
  }
};
warnDefault("JWT_ACCESS_SECRET", ["change-me-access-secret"]);
warnDefault("JWT_REFRESH_SECRET", ["change-me-refresh-secret"]);

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  appName: process.env.APP_NAME ?? "MyApp",
  appUrl: process.env.APP_URL ?? "http://localhost:4000",
  frontendUrls: (process.env.FRONTEND_URLS ?? "").split(",").map((s) => s.trim()).filter(Boolean),

  mongoUri: process.env.MONGODB_URI,

  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
  bcryptRounds: Number(process.env.BCRYPT_SALT_ROUNDS ?? 12),

  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
  },
  mailEnabled: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER),

  otpExpireMinutes: Number(process.env.OTP_EXPIRE_MINUTES ?? 10),
  otpMaxAttempts: Number(process.env.OTP_MAX_ATTEMPTS ?? 5),

  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",

  twilio: {
    sid: process.env.TWILIO_ACCOUNT_SID ?? "",
    token: process.env.TWILIO_AUTH_TOKEN ?? "",
    from: process.env.TWILIO_PHONE_NUMBER ?? "",
  },
  smsEnabled: Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  ),

  cloudinary: {
    name: process.env.CLOUDINARY_CLOUD_NAME ?? "",
    apiKey: process.env.CLOUDINARY_API_KEY ?? "",
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
    folder: process.env.CLOUDINARY_FOLDER ?? "app-uploads",
    maxImageMb: Number(process.env.UPLOAD_MAX_IMAGE_MB ?? 5),
    maxVideoMb: Number(process.env.UPLOAD_MAX_VIDEO_MB ?? 50),
    maxDocMb: Number(process.env.UPLOAD_MAX_DOC_MB ?? 10),
  },

  isProd: (process.env.NODE_ENV ?? "development") === "production",
};
