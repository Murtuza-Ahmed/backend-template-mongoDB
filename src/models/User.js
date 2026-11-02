import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import { env } from "#src/config/env.js";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    // Null for Google-only accounts — never required at the schema level.
    password: {
      type: String,
      select: false,
      minlength: [8, "Password must be at least 8 characters"],
    },
    phone: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
    },
    avatarUrl: { type: String, default: null },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // How the account was created — a user can have both.
    providers: {
      type: [String],
      enum: ["local", "google"],
      default: ["local"],
    },
    googleId: { type: String, sparse: true, unique: true },

    accountVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // SHA-256 of the current refresh token — rotation + reuse detection.
    refreshTokenHash: { type: String, select: false, default: null },
    passwordResetTokenHash: { type: String, select: false, default: null },
    passwordResetExpires: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.password;
        delete ret.refreshTokenHash;
        delete ret.passwordResetTokenHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.index({ createdAt: -1 });

// NOTE the `return` — without it the hook would re-hash on every save.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, env.bcryptRounds);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.models.User || mongoose.model("User", userSchema);
