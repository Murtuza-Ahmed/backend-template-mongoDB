import { User } from "#src/models/User.js";
import { Otp } from "#src/models/Otp.js";
import { ApiError } from "#src/utils/ApiError.js";
import { signAccessToken, signRefreshToken, hashToken, verifyRefreshToken } from "#src/utils/tokens.js";
import { generateOtp, hashOtp, generateResetToken } from "#src/utils/otp.js";
import { sendMail } from "#src/mail/mailer.js";
import { mailTemplates } from "#src/mail/templates.js";
import { sendSms } from "#src/utils/sms.js";
import { verifyGoogleIdToken, googleConfigured } from "#src/config/google.js";
import { env } from "#src/config/env.js";
import logger from "#src/utils/logger.js";

// ── internal helpers ─────────────────────────────────

async function issueTokens(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
}

async function createOtp(email, purpose, meta = {}) {
  await Otp.deleteMany({ email, purpose }); // one active code per purpose
  const { code, codeHash } = generateOtp();
  await Otp.create({
    email,
    purpose,
    codeHash,
    expiresAt: new Date(Date.now() + env.otpExpireMinutes * 60 * 1000),
    meta,
  });
  return code;
}

async function consumeOtp(email, purpose, code) {
  const record = await Otp.findOne({ email, purpose });
  if (!record) throw ApiError.badRequest("No active code found — request a new one");

  if (record.attempts >= env.otpMaxAttempts) {
    await Otp.deleteOne({ _id: record._id });
    throw ApiError.tooMany("Too many wrong attempts — request a new code");
  }
  if (record.expiresAt < new Date()) {
    await Otp.deleteOne({ _id: record._id });
    throw ApiError.badRequest("Code expired — request a new one");
  }
  if (record.codeHash !== hashOtp(code)) {
    record.attempts += 1;
    await record.save();
    throw ApiError.badRequest("Invalid code");
  }
  const meta = record.meta ?? {};
  await Otp.deleteMany({ email, purpose });
  return meta;
}

function safeUser(user) {
  return user.toJSON();
}

// ── public API ───────────────────────────────────────

export async function signup({ name, email, phone, password }) {
  const exists = await User.findOne({ email });
  if (exists) throw ApiError.conflict("An account with this email already exists");

  const user = await User.create({ name, email, phone, password, providers: ["local"] });

  const code = await createOtp(email, "email_verification");
  await sendMail({
    to: email,
    subject: `Verify your email — ${env.appName}`,
    html: mailTemplates.verifyEmail(code, env.otpExpireMinutes),
  });

  logger.info(`Signup: ${email} — verification OTP sent`);
  return { email: user.email, message: "Account created — check your email for the verification code" };
}

export async function verifyEmail({ email, otp }) {
  await consumeOtp(email, "email_verification", otp);

  const user = await User.findOne({ email });
  if (!user) throw ApiError.notFound("Account not found");

  user.accountVerified = true;
  const tokens = await issueTokens(user);

  await sendMail({
    to: email,
    subject: `Welcome to ${env.appName} 🎉`,
    html: mailTemplates.welcome(user.name),
  });

  return { user: safeUser(user), ...tokens };
}

export async function signin({ email, password }) {
  const user = await User.findOne({ email }).select("+password +refreshTokenHash");
  if (!user || !user.password) throw ApiError.unauthorized("Invalid email or password");
  if (!user.isActive) throw ApiError.forbidden("Account is deactivated");
  if (!user.accountVerified) {
    const err = ApiError.forbidden("Please verify your email first");
    err.code = "EMAIL_NOT_VERIFIED";
    throw err;
  }
  const ok = await user.comparePassword(password);
  if (!ok) throw ApiError.unauthorized("Invalid email or password");

  const tokens = await issueTokens(user);
  return { user: safeUser(user), ...tokens };
}

export async function googleSignin({ idToken }) {
  if (!googleConfigured()) {
    throw ApiError.badRequest("Google login is not configured (GOOGLE_CLIENT_ID missing)");
  }
  let profile;
  try {
    profile = await verifyGoogleIdToken(idToken);
  } catch {
    throw ApiError.unauthorized("Invalid Google token");
  }
  if (!profile.emailVerified) throw ApiError.badRequest("Google email is not verified");

  let user = await User.findOne({ $or: [{ googleId: profile.googleId }, { email: profile.email }] })
    .select("+refreshTokenHash");

  if (!user) {
    user = await User.create({
      name: profile.name ?? profile.email.split("@")[0],
      email: profile.email,
      googleId: profile.googleId,
      avatarUrl: profile.picture ?? null,
      providers: ["google"],
      accountVerified: true,
    });
    logger.info(`Google signup: ${profile.email}`);
  } else {
    // Link Google to an existing local account with the same email.
    let changed = false;
    if (!user.googleId) { user.googleId = profile.googleId; changed = true; }
    if (!user.providers.includes("google")) { user.providers.push("google"); changed = true; }
    if (!user.accountVerified) { user.accountVerified = true; changed = true; }
    if (!user.isActive) throw ApiError.forbidden("Account is deactivated");
    if (changed) await user.save({ validateBeforeSave: false });
  }

  const tokens = await issueTokens(user);
  return { user: safeUser(user), ...tokens };
}

export async function refresh(refreshToken) {
  if (!refreshToken) throw ApiError.unauthorized("Refresh token required");

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }

  const user = await User.findById(payload.sub).select("+refreshTokenHash");
  if (!user || !user.isActive) throw ApiError.unauthorized("Invalid refresh token");

  // Reuse detection — a stolen/old token kills the whole session.
  if (!user.refreshTokenHash || user.refreshTokenHash !== hashToken(refreshToken)) {
    user.refreshTokenHash = null;
    await user.save({ validateBeforeSave: false });
    throw ApiError.unauthorized("Session revoked — please sign in again");
  }

  const tokens = await issueTokens(user); // rotation: old token dies here
  return { user: safeUser(user), ...tokens };
}

export async function logout(userId) {
  await User.findByIdAndUpdate(userId, { refreshTokenHash: null });
}

export async function forgotPassword({ email }) {
  // Always respond success — never reveal whether the email exists.
  const user = await User.findOne({ email });
  if (user && user.isActive) {
    const { token, tokenHash } = generateResetToken();
    user.passwordResetTokenHash = tokenHash;
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${env.frontendUrls[0] ?? env.appUrl}/reset-password?token=${token}`;
    await sendMail({
      to: email,
      subject: `Reset your password — ${env.appName}`,
      html: mailTemplates.resetPassword(resetUrl),
    });
  }
  return { message: "If an account exists for this email, a reset link was sent" };
}

export async function resetPassword({ token, newPassword }) {
  const tokenHash = hashToken(token);
  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpires: { $gt: new Date() },
  }).select("+passwordResetTokenHash");

  if (!user) throw ApiError.badRequest("Reset link is invalid or expired");

  user.password = newPassword; // pre-save hook hashes it
  user.passwordResetTokenHash = null;
  user.passwordResetExpires = null;
  user.refreshTokenHash = null; // every other session is signed out
  await user.save();

  await sendMail({
    to: user.email,
    subject: `Password changed — ${env.appName}`,
    html: mailTemplates.passwordChanged(),
  });

  return { message: "Password changed — please sign in again" };
}

export async function forgotEmailRequest({ phone }) {
  const user = await User.findOne({ phone });
  // Don't reveal whether the phone exists either.
  if (user && user.isActive) {
    const code = await createOtp(user.email, "email_recovery");
    await sendSms({ to: phone, body: `${env.appName}: your code is ${code}. Valid ${env.otpExpireMinutes} min.` });
  }
  return { message: "If an account exists for this phone, a code was sent" };
}

export async function recoverEmail({ phone, otp }) {
  const user = await User.findOne({ phone });
  if (!user) throw ApiError.badRequest("Invalid code");
  await consumeOtp(user.email, "email_recovery", otp);
  return { email: user.email };
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await User.findById(userId).select("+password");
  if (!user?.password) throw ApiError.badRequest("This account has no password (signed up with Google)");

  const ok = await user.comparePassword(currentPassword);
  if (!ok) throw ApiError.unauthorized("Current password is incorrect");

  user.password = newPassword;
  user.refreshTokenHash = null; // sign out everywhere else
  await user.save();

  await sendMail({
    to: user.email,
    subject: `Password changed — ${env.appName}`,
    html: mailTemplates.passwordChanged(),
  });

  return { message: "Password changed" };
}

export async function requestEmailChange(userId, { newEmail }) {
  const taken = await User.findOne({ email: newEmail });
  if (taken) throw ApiError.conflict("This email is already in use");

  const user = await User.findById(userId);
  const code = await createOtp(user.email, "email_change", { newEmail });
  await sendMail({
    to: newEmail,
    subject: `Verify your new email — ${env.appName}`,
    html: mailTemplates.verifyEmail(code, env.otpExpireMinutes),
  });
  return { message: "Verification code sent to your new email" };
}

export async function confirmEmailChange(userId, { otp }) {
  const user = await User.findById(userId);
  const { newEmail } = await consumeOtp(user.email, "email_change", otp);
  if (!newEmail) throw ApiError.badRequest("Invalid code");

  const oldEmail = user.email;
  user.email = newEmail;
  user.refreshTokenHash = null; // all sessions revoked
  await user.save();

  await sendMail({
    to: oldEmail,
    subject: `Email changed — ${env.appName}`,
    html: mailTemplates.emailChanged(newEmail),
  });

  return { message: "Email changed — please sign in again" };
}
