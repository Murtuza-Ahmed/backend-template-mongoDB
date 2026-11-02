import nodemailer from "nodemailer";
import { env } from "#src/config/env.js";
import logger from "#src/utils/logger.js";

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
    });
  }
  return transporter;
}

// Never throws — a failed email must not break the API flow.
// In dev without SMTP configured, the email content goes to the log.
export async function sendMail({ to, subject, html }) {
  if (!env.mailEnabled) {
    logger.warn(`[mail:dev-log] To: ${to} | Subject: ${subject}`);
    logger.debug(`[mail:dev-log] HTML: ${html.slice(0, 500)}…`);
    return { delivered: false, devLogged: true };
  }
  try {
    await getTransporter().sendMail({ from: env.smtp.from, to, subject, html });
    return { delivered: true };
  } catch (err) {
    logger.error(`Email to ${to} failed: ${err.message}`);
    return { delivered: false, error: err.message };
  }
}
