# Backend Template — Express + MongoDB

[![CI](https://github.com/Murtuza-Ahmed/backend-template-mongoDB/actions/workflows/ci.yml/badge.svg)](https://github.com/Murtuza-Ahmed/backend-template-mongoDB/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A premium, production-ready Express + MongoDB starter with complete auth —
built so any developer can fork it, rename it, and start building.

## What's inside

| Area               | Details                                                                                                                      |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| **Auth**           | Signup + email OTP verification, signin, JWT access/refresh with **rotation + reuse detection**, logout                      |
| **Google login**   | `POST /api/auth/google` — verify Google ID token, auto find-or-create user                                                   |
| **Password flows** | Forgot password (reset link email), reset password, change password                                                          |
| **Forgot email**   | Phone → SMS OTP → recover your email (Twilio, dev-log fallback)                                                              |
| **Email change**   | OTP to the new address, all sessions revoked, old address notified                                                           |
| **RBAC**           | `role: user \| admin`, `authorize("admin")` middleware                                                                       |
| **Mail**           | Premium branded HTML templates (OTP, welcome, reset, password-changed, email-changed)                                        |
| **Security**       | Helmet, rate limiting (strict on auth), NoSQL-injection guard, HPP, CORS allowlist, bcrypt-12, Joi validation, env fail-fast |
| **Architecture**   | Modules (`routes → controller → service → validation`), thin controllers, **dynamic router**                                 |
| **Users API**      | Profile (`/me`), admin CRUD, pagination + search, self-demote/self-delete guards                                             |
| **Uploads**        | Cloudinary — images/video/PDF, magic-byte validated, per-type size limits, dynamic folder                                    |

## Quick start

```bash
# 1. Get the code
git clone <your-fork-url> my-project
cd my-project

# 2. Install (Node 22+ required — see "engines" in package.json)
npm install

# 3. Configure — ONLY .env is used (copy the example, delete any old
#    config.env / dev.env — this template reads .env and nothing else)
cp .env.example .env
# → fill MONGODB_URI, JWT secrets (generate with the command below), SMTP creds

# 4. Run
npm run dev
```

Or with Docker (API + MongoDB in one command):

```bash
cp .env.example .env   # fill the secrets
docker compose up --build
```

Generate JWT secrets:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Health check: `GET http://localhost:4000/api/health`

## Environment variables

See `.env.example` — every variable is documented there. The app **refuses to
boot** if `MONGODB_URI`, `JWT_ACCESS_SECRET` or `JWT_REFRESH_SECRET` are
missing. SMTP/Twilio/Google are optional: without them the app runs fine and
emails/SMS fall back to the dev log.

## Project structure

```
server.js                 # entry: env → DB → app.listen
src/
  app.js                  # express factory (middleware, routes, errors)
  config/                 # env.js (validated), db.js, google.js
  models/                 # User.js, Otp.js (TTL auto-delete)
  modules/
    auth/                 # auth.routes.js → auth.controller.js → auth.service.js
    users/                # users.routes.js → users.controller.js → users.service.js
  routes/index.js         # ★ dynamic loader — auto-mounts every module
  middlewares/            # auth, authorize (RBAC), validate (Joi), rateLimit, error…
  mail/                   # mailer.js + premium templates.js (APP_NAME branded)
  utils/                  # ApiError, tokens, otp, cookies, sms, logger
```

**The golden rule:** controllers only validate → call service → respond.
All business logic lives in `*.service.js`.

## Adding a new module (dynamic router)

No router file to touch — ever:

1. Create `src/modules/orders/` with `orders.routes.js` (default-export the router),
   plus `orders.controller.js`, `orders.service.js`, `orders.validation.js`.
2. Restart — it's live at `/api/orders`.

The loader scans `src/modules/*/*.routes.js` and mounts each at `/api/<folder>`.

## API reference

**Auth** (`/api/auth`)

| Method & path                | Auth   | Description                                     |
| ---------------------------- | ------ | ----------------------------------------------- |
| `POST /signup`               | —      | Create account → OTP email                      |
| `POST /verify-email`         | —      | `{email, otp}` → verified + tokens              |
| `POST /signin`               | —      | `{email, password}` (verified accounts only)    |
| `POST /google`               | —      | `{idToken}` → Google login                      |
| `POST /refresh`              | cookie | Rotate refresh token                            |
| `POST /logout`               | ✅     | Clear session + cookies                         |
| `POST /forgot-password`      | —      | Reset-link email (always 200, no email probing) |
| `POST /reset-password`       | —      | `{token, newPassword, confirmPassword}`         |
| `POST /forgot-email`         | —      | `{phone}` → SMS OTP                             |
| `POST /recover-email`        | —      | `{phone, otp}` → returns your email             |
| `POST /change-password`      | ✅     | Revokes other sessions                          |
| `POST /change-email/request` | ✅     | OTP to the new address                          |
| `POST /change-email/confirm` | ✅     | `{otp}` → email changed, sessions revoked       |

**Users** (`/api/users`)

| Method & path            | Auth  | Description                       |
| ------------------------ | ----- | --------------------------------- |
| `GET /me`, `PATCH /me`   | ✅    | Own profile                       |
| `GET /`                  | admin | Paginated list + `?search=`       |
| `POST /`                 | admin | Create user (any role)            |
| `GET /:id`, `PATCH /:id` | admin | Read / update (can't demote self) |
| `DELETE /:id`            | admin | Delete (can't delete self)        |

**Uploads** (`/api/uploads` — needs Cloudinary creds in `.env`)

| Method & path                            | Auth | Description                                                                                                                                            |
| ---------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `POST /`                                 | ✅   | Multipart `file` → magic-byte validated (JPG/PNG/GIF/WebP/MP4/PDF), per-type size limits, stored under `<CLOUDINARY_FOLDER>/images\|videos\|documents` |
| `DELETE /?publicId=…&resourceType=image` | ✅   | Delete from Cloudinary                                                                                                                                 |

The folder is dynamic — set `CLOUDINARY_FOLDER=your-brand` once in `.env`
and every upload follows. No code change needed.

Auth accepts `Authorization: Bearer <accessToken>` **or** the `accessToken`
httpOnly cookie. Refresh token lives in the `refreshToken` cookie and rotates
on every use — reuse = session revoked.

## Google login setup (4 steps)

1. [Google Cloud Console](https://console.cloud.google.com) → new project
2. **APIs & Services → Credentials** → Create **OAuth client ID** (Web app)
3. Add your frontend origin to **Authorized JavaScript origins**
4. Copy the **Client ID** → `.env` as `GOOGLE_CLIENT_ID`

Frontend: use Google Identity Services to get an ID token, then
`POST /api/auth/google` with `{ "idToken": "..." }`. First login creates the
account (verified); later logins link to the same email.

## Make it yours (rename guide)

1. `package.json` → change `"name": "backend-template"`
2. `.env` → set `APP_NAME=YourName` (emails + logs follow automatically)
3. `src/mail/templates.js` → tweak the header color (`#f59e0b`) to your brand
4. Search the repo for `backend-template` and replace leftovers
5. Push to your own repo — done

## Security checklist before production

- [ ] Real random `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` (not the examples)
- [ ] `NODE_ENV=production`, `MONGODB_URI` points at Atlas (IP allowlist on)
- [ ] `FRONTEND_URLS` = only your real frontend origins
- [ ] SMTP credentials are App Passwords / transactional service keys
- [ ] `GOOGLE_CLIENT_ID` set if you use Google login
- [ ] Rate limits reviewed in `src/middlewares/rateLimit.js`

## Docker

```bash
docker compose up --build   # API on :4000, MongoDB on :27017
```

The `Dockerfile` (Node 22-alpine, non-root user, `/api/health` healthcheck)
guarantees the exact same runtime on every machine. `.dockerignore` keeps
secrets and junk out of the image.

## Deploy

**Render** — `render.yaml` is included (web service + env vars to fill in the
dashboard). **Vercel** — `vercel.json` maps `/api/*` to the app.

## License

MIT — fork it, rename it, ship it.
