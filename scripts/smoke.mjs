// CI smoke test — boots the app WITHOUT a database and checks the
// middleware chain: health, validation, auth guard, 404.
process.env.MONGODB_URI ??= "mongodb://localhost:27017/smoke";
process.env.JWT_ACCESS_SECRET ??= "smoke-access-secret-0123456789abcdef";
process.env.JWT_REFRESH_SECRET ??= "smoke-refresh-secret-0123456789abcdef";

const { createApp } = await import("../src/app.js");
const app = await createApp();

const server = await new Promise((resolve) => {
  const s = app.listen(0, () => resolve(s));
});
const base = `http://localhost:${server.address().port}`;

const checks = [];
const check = (name, ok) => {
  checks.push([name, ok]);
  if (!ok) console.error(`FAIL: ${name}`);
};

try {
  const health = await (await fetch(`${base}/api/health`)).json();
  check("health 200", health.success === true && health.status === "ok");

  const badSignup = await (
    await fetch(`${base}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "not-an-email" }),
    })
  ).json();
  check("validation 400", badSignup.success === false && badSignup.message === "Validation failed");

  const noAuth = await (await fetch(`${base}/api/users/me`)).json();
  check("auth guard 401", noAuth.success === false);

  const injection = await (
    await fetch(`${base}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: { $gt: "" }, email: "a@b.c", password: "x".repeat(9), confirmPassword: "x".repeat(9) }),
    })
  ).json();
  check("sanitizer strips $ keys", injection.success === false && injection.message === "Validation failed");

  const nf = await (await fetch(`${base}/nope`)).json();
  check("404 handler", nf.success === false);
} finally {
  server.close();
}

const failed = checks.filter(([, ok]) => !ok);
console.log(`${checks.length - failed.length}/${checks.length} smoke checks passed`);
process.exit(failed.length ? 1 : 0);
