import { OAuth2Client } from "google-auth-library";
import { env } from "#src/config/env.js";

// Verifies Google ID tokens sent by the frontend (Google Identity Services).
// No passport, no sessions — stateless, perfect for an API template.
const client = new OAuth2Client(env.googleClientId || undefined);

export async function verifyGoogleIdToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: env.googleClientId,
  });
  const payload = ticket.getPayload();
  return {
    googleId: payload.sub,
    email: payload.email,
    emailVerified: payload.email_verified,
    name: payload.name,
    picture: payload.picture,
  };
}

export const googleConfigured = () => Boolean(env.googleClientId);
