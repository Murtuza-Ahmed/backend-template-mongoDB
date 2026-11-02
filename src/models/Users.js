import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto"

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters long"],
    maxlength: [20, "Name cannot exceed 20 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters long"]
  },
  phone: {
    type: String,
    unique: true
  },
  accountVerified: {
    type: Boolean,
    default: false,
    required: true
  },
  verificationCode: {
    type: Number
  },
  verificationCodeExpire: {
    type: Date
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpire: {
    type: Date
  },
  refreshToken: { type: String },
  accessToken: { type: String }
},
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password
        return ret
      }
    }
  }
)

// Indexes for better query performance
UserSchema.index({ email: 1 })
UserSchema.index({ createdAt: -1 })

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  };
  this.password = await bcrypt.hash(this.password, 10)
})

UserSchema.methods.comparePassword = async function (enterPassword) {
  return await bcrypt.compare(enterPassword, this.password)
}

UserSchema.methods.generateVerificationCode = function () {
  const verificationCode = crypto.randomInt(10000, 99999)
  this.verificationCode = verificationCode
  this.verificationCodeExpire = Date.now() + 5 * 60 * 1000

  return verificationCode
}

UserSchema.methods.generateResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
}

const User = mongoose.models.Users || mongoose.model("Users", UserSchema)

export default User;