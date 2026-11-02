import mongoose, { Schema } from "mongoose";

// One collection for every OTP purpose — email verification, password
// reset via code, forgot-email recovery, email change. Only the SHA-256
// hash is stored; expired docs delete themselves via the TTL index.
const otpSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    purpose: {
      type: String,
      required: true,
      enum: ["email_verification", "password_reset", "email_recovery", "email_change"],
    },
    codeHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    // MongoDB deletes the doc automatically when this time passes.
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
    // Extra payload, e.g. { newEmail } for email_change.
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

otpSchema.index({ email: 1, purpose: 1 });

export const Otp = mongoose.models.Otp || mongoose.model("Otp", otpSchema);
