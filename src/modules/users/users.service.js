import { User } from "#src/models/User.js";
import { ApiError } from "#src/utils/ApiError.js";

// ── self ─────────────────────────────────────────────

export async function getMe(userId) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");
  return user;
}

export async function updateMe(userId, { name, phone, avatarUrl }) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone || null;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl || null;

  await user.save();
  return user;
}

// ── admin ────────────────────────────────────────────

export async function listUsers({ page = 1, limit = 20, search = "" }) {
  const filter = search
    ? { $or: [{ name: new RegExp(search, "i") }, { email: new RegExp(search, "i") }] }
    : {};
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function adminCreateUser({ name, email, phone, password, role }) {
  const exists = await User.findOne({ email });
  if (exists) throw ApiError.conflict("An account with this email already exists");

  // Admin-created accounts skip the email gate — the admin vouches for them.
  const user = await User.create({
    name, email, phone, password, role,
    providers: ["local"],
    accountVerified: true,
  });
  return user;
}

export async function getUserById(id) {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound("User not found");
  return user;
}

export async function adminUpdateUser(id, updates, actorId) {
  if (id === actorId.toString() && updates.role && updates.role !== "admin") {
    throw ApiError.badRequest("You cannot demote yourself");
  }
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound("User not found");

  for (const key of ["name", "phone", "role", "isActive"]) {
    if (updates[key] !== undefined) user[key] = updates[key];
  }
  if (updates.isActive === false) user.refreshTokenHash = null; // kick them out

  await user.save();
  return user;
}

export async function adminDeleteUser(id, actorId) {
  if (id === actorId.toString()) throw ApiError.badRequest("You cannot delete yourself");
  const user = await User.findByIdAndDelete(id);
  if (!user) throw ApiError.notFound("User not found");
  return { message: "User deleted" };
}
