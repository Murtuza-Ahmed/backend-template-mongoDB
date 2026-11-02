import crypto from "node:crypto";

// 6-digit OTP. Only the SHA-256 hash is stored — the plain code
// lives only in the email/SMS that goes to the user.
export function generateOtp() {
  const code = crypto.randomInt(100000, 999999).toString();
  const codeHash = crypto.createHash("sha256").update(code).digest("hex");
  return { code, codeHash };
}

export function hashOtp(code) {
  return crypto.createHash("sha256").update(String(code).trim()).digest("hex");
}

export function generateResetToken() {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  return { token, tokenHash };
}
