import twilio from "twilio";
import { env } from "#src/config/env.js";
import logger from "#src/utils/logger.js";

let client = null;
function getClient() {
  if (!client) client = twilio(env.twilio.sid, env.twilio.token);
  return client;
}

// Never throws. Without Twilio configured, the SMS goes to the dev log.
export async function sendSms({ to, body }) {
  if (!env.smsEnabled) {
    logger.warn(`[sms:dev-log] To: ${to} | ${body}`);
    return { delivered: false, devLogged: true };
  }
  try {
    await getClient().messages.create({ to, from: env.twilio.from, body });
    return { delivered: true };
  } catch (err) {
    logger.error(`SMS to ${to} failed: ${err.message}`);
    return { delivered: false, error: err.message };
  }
}
